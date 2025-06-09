export default function Logo() {
    return (
        <div style={{ display: "grid", justifyItems: "center", position: "relative", width: "min-content", backgroundColor: "#000", padding: "1rem", fontFamily: "var(--JuliusSansOne)" }}>
            <p style={{ fontSize: "var(--extraLargeFontSize)", color: "var(--color1)" }}>Luminous</p>
            <p style={{ fontSize: "var(--extraSmallFontSize)", position: "absolute", bottom: "1rem", left: "50%", translate: "-50% 0%", letterSpacing: "10px" }}>Lens</p>
        </div>
    )
}