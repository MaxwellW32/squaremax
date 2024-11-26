import React from 'react'

export default function Test() {
    return (
        <div>Test</div>
    )
}







// "use client"
// import { linkedDataType } from '@/types'
// import React, { useState } from 'react'

// const testimonialsObj: linkedDataType["testimonials"] = [
//     {
//         name: "max",
//         position: "manager",
//         photo: "url1",
//         text: "hi",
//         rating: 0,
//         date: "june",
//         links: ["link1"],
//         company: "comp",
//     },
//     {
//         name: "max2",
//         position: "manager2",
//         photo: "url2",
//         text: "hi2",
//         rating: 0,
//         date: "july",
//         links: ["link2", "link3"],
//         company: "comp2",
//     },
// ]

// export default function Test() {
//     const [form, formSet] = useState<linkedDataType["testimonials"]>({ ...testimonialsObj })

//     return (
//         <div>
//             <RecursiveView obj={form} formSet={formSet} keys="" />
//         </div>
//     )
// }

// function RecursiveView({ obj, formSet, keys }: { obj: any, keys: string, formSet: React.Dispatch<React.SetStateAction<formType>> }) {
//     function updateInput(seenKeys: string, newValue: any) {
//         formSet(prevForm => {
//             const newForm = { ...prevForm }
//             const keyArray = seenKeys.split("/");

//             let newTempForm = newForm
//             keyArray.forEach((eachKey, index) => {
//                 if (index === keyArray.length - 1) {
//                     newTempForm[eachKey] = newValue;

//                 } else {
//                     newTempForm = newTempForm[eachKey];
//                 }
//             });

//             return newForm
//         });
//     };

//     return (
//         <div style={{ display: "grid", alignContent: "flex-start", gap: "1rem", padding: "1rem" }}>
//             {Object.entries(obj).map(eachObjEntry => {
//                 const eachObjKey = eachObjEntry[0];
//                 const eachObjValue = eachObjEntry[1];

//                 // Concatenate parent key with current key, adding '/' between them for hierarchy
//                 const newKeys = keys !== "" ? `${keys}/${eachObjKey}` : eachObjKey;

//                 if (typeof eachObjValue === "object") {
//                     // Recursively render nested object, pass down the updated key path
//                     return (
//                         <div key={newKeys} style={{ display: "grid", alignContent: "flex-start", gap: "1rem" }}>
//                             <label>{eachObjKey}</label>

//                             <RecursiveView obj={eachObjValue} formSet={formSet} keys={newKeys} />
//                         </div>
//                     );
//                 }

//                 return (
//                     <div key={eachObjKey} style={{ display: "grid", alignContent: "flex-start", border: "1px solid #000" }}>
//                         <label>{eachObjKey}</label>

//                         <p>Keys: {newKeys}</p>

//                         <input type='text' value={`${eachObjValue}`} placeholder={`please enter ${keys}`}
//                             onChange={(e) => {
//                                 updateInput(newKeys, e.target.value)
//                             }}
//                         />
//                     </div>
//                 );
//             })}
//         </div>
//     );
// }