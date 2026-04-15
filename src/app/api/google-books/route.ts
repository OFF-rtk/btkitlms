import { NextRequest } from "next/server";

/* ── GET /api/google-books?isbn=<isbn> — server-side proxy to Google Books API ── */
export async function GET(request: NextRequest) {
    const isbn = request.nextUrl.searchParams.get("isbn");
    if (!isbn) {
        return Response.json({ error: "isbn query param is required" }, { status: 400 });
    }

    const cleanIsbn = isbn.replace(/[-\s]/g, "");

    try {
        const res = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}&maxResults=1`,
            { next: { revalidate: 3600 } }
        );

        if (!res.ok) {
            return Response.json({ error: "Google Books API returned an error" }, { status: 502 });
        }

        const data = await res.json();

        if (!data.totalItems || !data.items?.[0]?.volumeInfo) {
            return Response.json({ found: false });
        }

        const info = data.items[0].volumeInfo;

        return Response.json({
            found: true,
            book: {
                title: info.title || "Unknown Title",
                author: (info.authors || ["Unknown Author"]).join(", "),
                isbn: cleanIsbn,
                cover_url: info.imageLinks?.thumbnail?.replace("http://", "https://") || null,
            },
        });
    } catch {
        return Response.json({ error: "Failed to reach Google Books API" }, { status: 502 });
    }
}
