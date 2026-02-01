"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import type { auth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import {
  Calculator,
  Brain,
  Newspaper,
  IndianRupee,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl: string | null;
}

interface DashboardClientProps {
  session: typeof auth.$Infer.Session;
}

export default function DashboardClient({ session }: DashboardClientProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [displayCount, setDisplayCount] = useState(12);
  const loaderRef = useRef<HTMLDivElement>(null);

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

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          displayCount < articles.length &&
          !loadingMore
        ) {
          setLoadingMore(true);
          setTimeout(() => {
            setDisplayCount((prev) => Math.min(prev + 12, articles.length));
            setLoadingMore(false);
          }, 300);
        }
      },
      { threshold: 0.5, rootMargin: "100px" },
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [displayCount, articles.length, loadingMore]);

  const visibleArticles = articles.slice(0, displayCount);

  const features = [
    {
      title: "Tax Calculator",
      description: "Calculate your income tax for both Old and New regimes",
      icon: Calculator,
      href: "/tax-calculator",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Expense Tracker",
      description: "Track and categorize your monthly expenses",
      icon: IndianRupee,
      href: "/expenses",
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "AI Financial Advisor",
      description: "Get personalized financial advice powered by AI",
      icon: Brain,
      href: "/ai-advisor",
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "News",
      description: "Stay updated with the latest news from India",
      icon: Newspaper,
      href: "/news",
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {session.user.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your finances and plan your taxes efficiently
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature) => (
          <Link key={feature.href} href={feature.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div
                  className={`w-12 h-12 rounded-lg ${feature.bg} flex items-center justify-center mb-2`}
                >
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Financial News Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Newspaper className="h-6 w-6" />
              News
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Stay updated with the latest news from India
            </p>
          </div>
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleArticles.map((article, idx) => (
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

            {/* Infinite scroll loader */}
            {displayCount < articles.length && (
              <div
                ref={loaderRef}
                className="flex justify-center py-8 min-h-25"
              >
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Loading more news...</span>
                </div>
              </div>
            )}

            {/* Show total count */}
            {displayCount >= articles.length && articles.length > 0 && (
              <div className="text-center py-6 text-gray-600">
                <p className="text-sm">
                  Showing all {articles.length} articles
                </p>
              </div>
            )}

            {/* Removed Load More Button - using auto-scroll only */}
          </>
        )}
      </div>
    </div>
  );
}
