import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const token = req.cookies.token;
    if (!token) {
        res.status(401).json({ message: "Not authenticated" });
    } else {
        res.status(200).json({ message: "Authenticated" });
    }
}
