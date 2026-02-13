import dotenv from "dotenv";
import Mailgen from "mailgen";
import { Resend } from "resend";

dotenv.config();

const resend = new Resend("re_NzEyq5iG_8pZTdcHQQxx1W6GS8R11q2k5");

const sendEmail = async (options) => {

    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Project Management App",
            link: "https://eccomerce.app/"
        }
    });

    const emailTextual = mailGenerator.generatePlaintext(
        options.mailgenContent
    );

    const emailHtml = mailGenerator.generate(
        options.mailgenContent
    );

    const recipient =
        process.env.NODE_ENV === "production"
            ? process.env.TEST_EMAIL
            : options.email;

    try {
        await resend.emails.send({
            from: "Eccomerce app <onboarding@resend.dev>",
            to: recipient,
            subject: options.subject,
            html: emailHtml,
            text: emailTextual
        });

        console.log("📨 Email sent successfully");

    } catch (error) {
        console.error("❌ Email sending failed:", error);
    }
};


const emailVerificationMailgenContent = (username, verficationUrl) => {
    return {
        body: {
            name: username,
            intro: "Welcome to project management app! We're very excited to have you on board.",
            action: {
                instructions: "To verify your email, please click here:",
                button: {
                    color: "#22BC66",
                    text: "Confirm your email",
                    link: verficationUrl
                }
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help."
        }
    }
}
const forgotPasswordMailgenContent = (username, resetUrl) => {
    return {
        body: {
            name: username,
            intro: "We got a request to reset your password",
            action: {
                instructions: "To reset your password, please click here:",
                button: {
                    color: "#22BC66",
                    text: "Confirm your email",
                    link: resetUrl
                }
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help."
        }
    }
}

export { emailVerificationMailgenContent, sendEmail, forgotPasswordMailgenContent }