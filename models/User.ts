import bcrypt from "bcryptjs";
import mongoose, { model, models, Schema } from "mongoose";
 
interface IUser {
  email: string;
  password: string;
  roll: "user" | "admin";
  _id?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true},
  roll: { type: String, enum:["user", "admin"], default: "user" },
}, {timestamps: true});

userSchema.pre("save", async function (next) {
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
})

const User = models?.User || model<IUser>("User", userSchema);

export default User;