import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

transporter.verify().then(() => {
    console.log('SMTP transporter is ready');
}).catch((error) => {
    console.error('SMTP transporter verification failed:', error);
});

export default transporter;
