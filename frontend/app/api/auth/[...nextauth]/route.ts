import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      // यहाँ हामीले सिधै आईडी नराखी .env.local बाट तानेका छौँ
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  httpOptions: {
    timeout: 15000, // विन्डोजमा कनेक्सन टाइम-आउट हुन नदिन यो राख्नै पर्छ
  },
});

export { handler as GET, handler as POST };