export function generateEmailBodyNewUser(username: string, confirmID: string): string {
    return `<b>Hey ${username}! </b><br>
	We are happy to have you here at Naan Tube.<br>
	Please confirm your email using this link : <a href='http://${process.env.REACT_APP_SERVER_ADDRESS}:3000/confirm/${confirmID}'>
	http://${process.env.REACT_APP_SERVER_ADDRESS}:3000/confirm/${confirmID}</a> <br/>`
}

export function generateEmailBodyForgotPwd(username: string, confirmID: string): string {
    return `<b>Hey ${username}! </b><br>
	Someone requested a password reset for your account.<br>
	To reset your password, please go to : <a href='http://${process.env.REACT_APP_SERVER_ADDRESS}:3000/forgot/${confirmID}'>
	http://${process.env.REACT_APP_SERVER_ADDRESS}:3000/forgot/${confirmID}</a> <br/><br/>
	If it was not you, just ignore this email and nothing will happen`
}
