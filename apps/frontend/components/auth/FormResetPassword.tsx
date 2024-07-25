interface Prop {
    error: string
    message: string
}
function FormResetPassword({ error, message }: Prop) {
    return error !== '' ? (
        <div className="brightness-100 text-rose-600 hover:brightness-150 border-slate-400 ">
            {message} {error}
        </div>
    ) : (
        <></>
    )
}

export default FormResetPassword
