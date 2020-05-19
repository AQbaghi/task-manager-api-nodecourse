const mongoose= require('mongoose');
const validator= require('validator');
const bcrypt= require('bcrypt');
const jwt= require('jsonwebtoken');


const userSchema= new mongoose.Schema({
    name: {
        required: true,
        type: String,
        validate(value){
            if(!validator.isAlpha(value)){
                throw new Error('name must only contain letters');
            }
        }
    },
    email: {
        required: true,
        unique: true,
        type: String,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Must contain email');
            }
        }
    },
    password: {
        required: true,
        type: String,
        validate(value){
            if(value.length<8){
                throw new Error('password must be 8 charectors or more');
            }
        }
    },
    age: {
        type: Number,
        default: undefined,
        validate(value){
            if(value<0){
                throw new Error('age can not be a negative number');
            }
        }
    },
    number: {
        type: String,
        required: true,
        validate(value){
            if(value.length!==12){
                throw new Error('age can not be a negative number');
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

// virtual schema not in use... to connect user to tasks, not tasks to user.
// userSchema.virtual('tasks', {
//     ref: 'Task',
//     localField: '_id',
//     foreignField: 'owner'
// });

//genarating tokens for signing up
userSchema.methods.genarateAuthToken= async function(){
    const user= this;
    const token= await jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    user.tokens= user.tokens.concat({ token });
    user.save();
    return token;
}

//logging in user with email and password user middleware-mongoose-schema
userSchema.statics.findByCredentials= async (email, password)=>{
    const user= await User.findOne({ email });
    if(!email){
        throw new Error('unable to login user');
    }
    const isMatch= await bcrypt.compare(password, user.password);
    if(!isMatch){
        throw new Error('unable to login user');
    }
    return user;
}

//sending back profile schema
userSchema.methods.toJSON= function(){
    const user= this;
    //clone object
    const userObject= user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
} 

//password hashing schema-middleware on mongoose before saving password
userSchema.pre('save', async function(next){
    const user= this;
    if(user.isModified('password')){
        user.password= await bcrypt.hash(user.password, 8);
    }
    next();
});

const User= mongoose.model('User', userSchema);

module.exports= User;