"use client";

import { useState, useEffect } from "react";
import type { auth } from "@/lib/auth";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Newspaper, ExternalLink, RefreshCw } from "lucide-react";
// import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl: string | null;
}

interface NewsClientProps {
  session: typeof auth.$Infer.Session;
}

export default function NewsClient({ session }: NewsClientProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNews = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/news");
      const data = await response.json();

      if (response.ok) {
        setArticles(data.articles);
      } else {
        setError(data.error || "Failed to fetch news");
      }
    } catch {
      setError("An error occurred while fetching news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Newspaper className="h-8 w-8" />
            News
          </h1>
          <p className="text-gray-600 mt-2">
            Stay updated with the latest news from India
          </p>
        </div>

        {/* <Button onClick={fetchNews} disabled={loading} variant="outline">
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button> */}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && articles.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Newspaper className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              No news articles available at the moment
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, idx) => (
            <Card
              key={idx}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              {article.imageUrl && (
                <div className="h-48 overflow-hidden relative">
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="secondary">{article.source}</Badge>
                  <span className="text-xs text-gray-500">
                    {format(new Date(article.publishedAt), "MMM dd, yyyy")}
                  </span>
                </div>
                <CardTitle className="text-lg line-clamp-2">
                  {article.title}
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  {article.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary hover:underline text-sm font-medium"
                >
                  Read full article
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
