"use client"
import React, { useEffect, useRef, useState } from 'react'
import styles from "./styles.module.css"

type bubble = {
  id: string,
  img: string,
  el: HTMLDivElement,
  x: number,
  y: number,
  velocityX: number,
  velocityY: number,
}

export default function BubblePhysics() {
  //figure out collision
  //figure out gravity
  //attraction - repulsion

  const contRef = useRef<HTMLDivElement>(null)
  const bubbles = useRef<bubble[]>([])

  const [started, startedSet] = useState(false)

  //add a bubble off start
  useEffect(() => {
    if (!started) {
      setTimeout(() => {
        startedSet(true)
      }, 100);

      return
    }

    start()
  }, [started])

  function start() {
    const createdBubbles = createBubbles(contRef, 2)

    createdBubbles.forEach(createdBubble => {
      addBubbleToContainerEl(createdBubble, contRef)

      addBubbleToBubblesArr(createdBubble)
    });

    bubbleMoveLoop()
  }

  //have a function that sets the initial velocity of the circles
  //have a move loop that takes the velocity on each circle and applies its translation
  //have bubble interact with each other


  function bubbleMoveLoop() {
    requestAnimationFrame(bubbleMoveLoop)

    let collidedWithId: null | string = null

    bubbles.current.forEach(eachBubble => {
      //het new possible bubble position
      const newBubblePosition = getNewBubblePosition(eachBubble, contRef)
      if (newBubblePosition === undefined) return

      //ensure bubble wasnt collided with arleady
      if (collidedWithId === eachBubble.id) {
        console.log(`$bubble already collided with on this run`);
        return
      }

      //check collisions with every other bubble
      bubbles.current.forEach(eachSubBubble => {
        if (eachBubble.id === eachSubBubble.id) return

        const collided = checkBubbleIntersection({ x: newBubblePosition.newLeft, y: newBubblePosition.newTop, width: eachBubble.el.clientWidth }, { x: eachSubBubble.x, y: eachSubBubble.y, width: eachSubBubble.el.clientWidth })

        if (collided) {
          collidedWithId = eachSubBubble.id
          console.log(`bubble ${eachBubble.id} collided with ${collidedWithId}`);

          const newBubbleVelocity = getBubbleNewVelocityFromCollision({ ...eachBubble, x: newBubblePosition.newLeft, y: newBubblePosition.newTop }, eachSubBubble)
          if (newBubbleVelocity === undefined) return

          //set new velocity values
          eachBubble.velocityX = newBubbleVelocity.newVelocityX
          eachBubble.velocityY = newBubbleVelocity.newVelocityY

          eachSubBubble.velocityX = newBubbleVelocity.newVelocity2X
          eachSubBubble.velocityY = newBubbleVelocity.newVelocity2Y
        }
      })

      //update x and y on bubble
      if (collidedWithId === null) {
        eachBubble.x = newBubblePosition.newLeft
        eachBubble.y = newBubblePosition.newTop
      }

      console.log(`$eachBubble ${eachBubble.id}`, eachBubble.velocityX);

      //apply to screen
      eachBubble.el.style.translate = `${eachBubble.x}px ${eachBubble.y}px`;
    })
  }

  function createBubbles(contRef: React.RefObject<HTMLDivElement>, numberOfBubbles = 3, img = "") {
    if (contRef.current === null) return []

    const widthMultiplier = (1 / numberOfBubbles) * .6
    const bubbleWidth = contRef.current.clientWidth * widthMultiplier
    const leftOverSpace = (1 - widthMultiplier) / numberOfBubbles

    const bubbles: bubble[] = []

    for (let index = 0; index < numberOfBubbles; index++) {
      const newBubbleEl = document.createElement("div")

      const bubbleX = (bubbleWidth * index) + Math.floor(Math.random() * (leftOverSpace - 2)) + 2
      const bubbleY = Math.floor(Math.random() * (contRef.current.clientHeight - bubbleWidth))

      const newBubble: bubble = {
        id: `${index + 1}`,
        img: img,
        el: newBubbleEl,
        x: bubbleX,
        y: bubbleY,
        velocityX: 0,
        velocityY: 0
      }

      newBubble.el.classList.add(styles.bubble)
      newBubble.el.style.width = `${widthMultiplier * 100}%`

      newBubble.el.style.translate = `${bubbleX}px ${bubbleY}px`

      bubbles.push(newBubble)
    }

    return bubbles
  }

  function addBubbleToContainerEl(bubble: bubble, contRef: React.RefObject<HTMLDivElement>) {
    if (!contRef.current) return

    contRef.current.append(bubble.el)
  }

  function addBubbleToBubblesArr(bubble: bubble) {
    bubbles.current.push(bubble)
  }

  function getNewBubblePosition(bubble: bubble, contRef: React.RefObject<HTMLDivElement>) {
    if (contRef.current === null) return

    const currentLeft = bubble.x;
    const currentTop = bubble.y;

    let newLeft = currentLeft + bubble.velocityX;
    let newTop = currentTop + bubble.velocityY;

    let shouldReverseX = false
    let shouldReverseY = false

    // Ensure the bubble stays within the container bounds  
    if (newLeft < 0) {
      newLeft = 0
      shouldReverseX = true
    }

    if (newTop < 0) {
      newTop = 0
      shouldReverseY = true
    }

    if (newLeft > (contRef.current.clientWidth - bubble.el.clientWidth)) {
      newLeft = contRef.current.clientWidth - bubble.el.clientWidth;
      shouldReverseX = true
    }

    if (newTop > (contRef.current.clientHeight - bubble.el.clientHeight)) {
      newTop = contRef.current.clientHeight - bubble.el.clientHeight;
      shouldReverseY = true
    }











    return { newLeft, newTop, shouldReverseX, shouldReverseY }
  }

  function setBubbleVelocityFromAPoint(bubble: bubble, activePoint: { x: number, y: number }, contRef: React.RefObject<HTMLDivElement>) {
    if (contRef.current === null) return

    const currentLeft = bubble.x;
    const currentTop = bubble.y;

    const circleCenterX = currentLeft + (bubble.el.clientWidth / 2);
    const circleCenterY = currentTop + (bubble.el.clientHeight / 2);

    const directionX = activePoint.x - circleCenterX;
    const directionY = activePoint.y - circleCenterY;

    const angle = Math.atan2(directionY, directionX)

    const magnitude = 1.0;
    const xVelocity = Math.cos(angle) * magnitude;
    const yVelocity = Math.sin(angle) * magnitude;

    bubble.velocityX = xVelocity
    bubble.velocityY = yVelocity

    // console.log(`$start`);
    // console.log(`$activePoint.current.x`, activePoint.current.x);
    // console.log(`$activePoint.current.y`, activePoint.current.y);
    // console.log(`$circleCenterX`, circleCenterX);
    // console.log(`$circleCenterY`, circleCenterY);
    // console.log(`$directionX`, directionX);
    // console.log(`$directionY`, directionY);
    // console.log(`$newLeft`, newLeft);
    // console.log(`$newTop`, newTop);

    // let canMoveX = true;
    // let canMoveY = true;

    // // Check for intersections with other bubbles
    // bubbles.current.forEach((eachBubble) => {
    //   if (eachBubble.id === bubble.id) return;

    //   const checkBubbleIntersectionResult = checkBubbleIntersection(eachBubble, bubble);
    //   if (checkBubbleIntersectionResult) {
    //     canMoveX = false;
    //     canMoveY = false;
    //   }
    // });

    // If movement is allowed, apply the new position
    // if (canMoveX && !canMoveY) {
    //   bubble.el.style.translate = `${newLeft}px ${currentTop}px`;

    //   console.log(`$hit canMoveX`);
    // }
    // if (canMoveY && !canMoveX) {
    //   bubble.el.style.translate = `${currentLeft}px ${newTop}px`;
    //   console.log(`$hit canMoveY`);

    // }
    // if (canMoveX && canMoveY) {
    //   console.log(`$hit can move both`);
    //   bubble.el.style.translate = `${newLeft}px ${newTop}px`;
    // }
  }

  function getBubbleNewVelocityFromCollision(bubble1: bubble, bubble2: bubble) {
    const dx = bubble2.x - bubble1.x;
    const dy = bubble2.y - bubble1.y;

    // Calculate the distance between the bubbles
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate the normal vector
    const nx = dx / distance;
    const ny = dy / distance;

    // Calculate the relative velocity in terms of the normal direction
    const dvx = bubble1.velocityX - bubble2.velocityX;
    const dvy = bubble1.velocityY - bubble2.velocityY;

    // Calculate relative velocity in normal direction
    const vn = dvx * nx + dvy * ny;

    // Do not resolve if velocities are separating
    if (vn > 0) return;

    // Calculate the impulse scalar
    // const mass1 = 1; // Assume default mass of 1 if not specified
    // const mass2 = 1; // Assume default mass of 1 if not specified

    // const impulse = (2 * vn) / (mass1 + mass2);

    // Calculate the impulse vector
    // const ix = impulse * nx;
    // const iy = impulse * ny;

    // Update the velocities of the bubble
    return {
      // newVelocityX: bubble1.velocityX - ix * mass2,
      // newVelocityY: bubble1.velocityY - iy * mass2,

      // newVelocity2X: bubble2.velocityX + ix * mass2,
      // newVelocity2Y: bubble2.velocityY + iy * mass2

      newVelocityX: bubble1.velocityX * -1,
      newVelocityY: bubble1.velocityY * -1,

      newVelocity2X: bubble2.velocityX * -1,
      newVelocity2Y: bubble2.velocityY * -1,
    }
  }

  function checkBubbleIntersection(bubbleInfo: { x: number, y: number, width: number }, bubbleInfo2: { x: number, y: number, width: number }) {
    const circleCenterX = bubbleInfo.x + (bubbleInfo.width / 2);
    const circleCenterY = bubbleInfo.y + (bubbleInfo.width / 2);
    const radius = bubbleInfo.width / 2;

    const circle2CenterX = bubbleInfo2.x + (bubbleInfo2.width / 2);
    const circle2CenterY = bubbleInfo2.y + (bubbleInfo2.width / 2);
    const radius2 = bubbleInfo2.width / 2;

    const distance = Math.sqrt(Math.pow(circle2CenterX - circleCenterX, 2) + Math.pow(circle2CenterY - circleCenterY, 2));

    return distance <= (radius + radius2);
  }

  return (
    <div ref={contRef} className={styles.cont}
      onMouseMove={(e) => {
        bubbles.current.forEach(eachBubble => {
          setBubbleVelocityFromAPoint(eachBubble, { x: e.clientX, y: e.clientY }, contRef)
        })
      }}
    >
    </div>
  )
}
