const ERRORS: Record<string, string> = {
    //message
    ErrorMsg: 'errorMsg',
    SuccessMsg: 'successMsg',
    NotConnected: 'notConnected',
    //sign in
    UnknownUsername: 'errors.unknownUsername',
    InvalidPassword: 'errors.invalidPassword',
    EmailNotVerified: 'errors.emailNotVerified',
    MissingPwd: 'errors.missingPwd',
    MissingUsername: 'errors.missingUsername',
    //sign up
    InvalidUsername: 'errors.invalidUsername',
    UsernameTaken: 'errors.usernameTaken',
    EmailTaken: 'errors.emailTaken',
    InvalidEmail: 'errors.invalidEmail',
    InvalidFirstName: 'errors.invalidFirstName',
    InvalidLastName: 'errors.invalidLastName',
    WrongEmailFormat: 'errors.wrongEmailFormat',
    InvalidDateBirth: 'errors.invalidDateBirth',
    InvalidGender: 'errors.invalidGender',
    InvalidInterest: 'errors.invalidInterest',
    InvalidPreference: 'errors.invalidPreference',
    InvalidBio: 'errors.invalidBio',
    MissingEmail: 'errors.missingEmail',
    MissingFirstName: 'errors.missingFirstName',
    MissingLastName: 'errors.missingLastName',
    MissingDateBirth: 'errors.missingDateBirth',
    MissingGender: 'errors.missingGender',
    WeakPwd: 'errors.weakPwd',
    InvalidId: 'errors.invalidId',
    AlreadyValid: 'errors.alreadyValid',
    //images
    InvalidPhotoExtension: 'errors.invalidPhotoExtension',
    EmptyPhoto: 'errors.emptyPhoto',
    PhotoTooBig: 'errors.photoTooBig',
    PhotoNbLimit: 'errors.photoNbLimit',
    PhotoResolution: 'errors.photoResolution',
    //request image
    EmptyPhotoId: 'errors.emptyPhotoId',
    InvalidPhotoId: 'errors.invalidPhotoId',
}

export const ErMsg = (key: string, t: (key: string) => string): string | null => {
    const item = ERRORS[key]
    return item ? t(item) : null
}
