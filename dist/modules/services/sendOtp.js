"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtp = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const otpGenerator_1 = require("./otpGenerator");
const verificationsModel_1 = __importDefault(require("../user/verificationsModel"));
const sendOtp = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const otp = (0, otpGenerator_1.generateOtp)();
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Register OTP Verification",
            text: `Your OTP for verification is ${otp}`,
            html: "",
        };
        const transporter = nodemailer_1.default.createTransport({
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
        const verificationDoc = yield verificationsModel_1.default.create({ email, otp });
        console.log(`OTP has been saved to verifications : ${verificationDoc}`);
    }
    catch (error) {
        console.error("error while sending otp=", error);
    }
});
exports.sendOtp = sendOtp;
