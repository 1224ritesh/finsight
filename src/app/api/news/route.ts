import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

interface NewsAPIArticle {
    title: string
    description: string
    url: string
    source: { name: string }
    publishedAt: string
    urlToImage: string
}

async function getSession(req: NextRequest) {
    const session = await auth.api.getSession({
        headers: req.headers,
    })
    return session
}

export async function GET(req: NextRequest) {
    try {
        const session = await getSession(req)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const apiKey = process.env.NEWS_API_KEY

        if (!apiKey) {
            console.error('NEWS_API_KEY not configured in environment variables')
            return NextResponse.json(
                { error: 'News API key not configured' },
                { status: 500 }
            )
        }

        // Fetch news from NewsAPI - all categories
        // Try multiple endpoints for better results
        const queries = [
            `https://newsapi.org/v2/top-headlines?country=in&pageSize=100&apiKey=${apiKey}`,
            `https://newsapi.org/v2/everything?q=india&language=en&sortBy=publishedAt&pageSize=100&apiKey=${apiKey}`,
        ]

        console.log('Fetching news from NewsAPI...')

        let articles: NewsAPIArticle[] = []
        let lastError: unknown = null

        // Try different queries until we get results
        for (const newsUrl of queries) {
            try {
                const response = await fetch(newsUrl, {
                    next: { revalidate: 3600 }
                })

                const data = await response.json()

                if (!response.ok) {
                    console.error('NewsAPI error:', data)
                    lastError = data
                    continue
                }

                if (data.articles && data.articles.length > 0) {
                    console.log(`Fetched ${data.articles.length} articles from NewsAPI`)
                    articles = data.articles
                    break
                }
            } catch (err) {
                console.error('NewsAPI fetch error:', err)
                lastError = err
            }
        }

        if (articles.length === 0) {
            console.error('No articles found from any NewsAPI endpoint')
            if (lastError) {
                console.error('Last error:', lastError)
            }
            return NextResponse.json(
                { error: lastError instanceof Error ? lastError.message : 'No news articles available' },
                { status: 500 }
            )
        }

        const formattedArticles = articles.map((article: NewsAPIArticle) => ({
            title: article.title,
            description: article.description,
            url: article.url,
            source: article.source.name,
            publishedAt: article.publishedAt,
            imageUrl: article.urlToImage,
        }))

        return NextResponse.json({ articles: formattedArticles })
    } catch (error) {
        console.error('News API error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch news' },
            { status: 500 }
        )
    }
}
