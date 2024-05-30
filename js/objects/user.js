class User {
    constructor (uid, firstName, lastName, email, mobile, userType ) {
        this.uid = uid;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.mobile = mobile;
        this.userType = userType;
    }
    toString() {
        return this.uid + ', ' + this.firstName + ', ' + this.lastName + ', ' + this.email + ', ' + this.mobile + ', ' + this.userType;
    }
}

const userConverter = {
    toFirestore: (user) => {
        return {
            uid: user.uid,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            mobile: user.mobile,
            userType: user.userType
        };
    },
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        return new User(data.uid, data.firstName, data.lastName, data.email, data.mobile, data.userType);
    }
};