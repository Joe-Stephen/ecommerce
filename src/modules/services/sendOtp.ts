import nodemailer from "nodemailer";
import {generateOtp} from "./otpGenerator";
import Verifications from "../user/verificationsModel";

export const sendOtp = async (email:string) => {
  try {
    const otp = generateOtp();
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Register OTP Verification",
      text: `Your OTP for verification is ${otp}`,
      html: "",
    };

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      service: "Gmail",

      auth: {
        user: process.env.EMAIL,
        pass: process.env.GOOGLE_APP_PASSWORD,
      },
    });

    transporter.sendMail(mailOptions);
    console.log(`OTP has been sent to ${email}`);
    const verificationDoc = await Verifications.create({ email, otp });
    console.log(`OTP has been saved to verifications : ${verificationDoc}`);
  } catch (error) {
    console.error("error while sending otp=", error);
  }
};
