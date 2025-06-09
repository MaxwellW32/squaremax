import styles from "./textInput.module.css"

export default function TextInput({
    name, value, onChange, label, id, errors, onBlur, placeHolder, isOptionalText, ...elProps }: {
        name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, onBlur?: (e: React.FocusEvent<HTMLInputElement, Element>) => void, label?: string, id?: string, errors?: string, placeHolder?: string, isOptionalText?: string
    } & React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div {...elProps}>
            {label !== undefined && <label className={styles.label} htmlFor={id !== undefined ? id : name}>{label}{isOptionalText !== undefined && <span>{isOptionalText}</span>}</label>}

            <input id={id !== undefined ? id : name} type='text' name={name} value={value} placeholder={placeHolder ?? ""} onChange={onChange} onBlur={(e) => { if (onBlur !== undefined) onBlur(e) }} />

            {errors !== undefined && <p style={{ color: "red", fontSize: "var(--fontSizeS)" }}>{errors}</p>}
        </div>
    )
}
