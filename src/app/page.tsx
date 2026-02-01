import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calculator,
  TrendingUp,
  Brain,
  Newspaper,
  Shield,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: Calculator,
      title: "Tax Calculator",
      description:
        "Instantly calculate income tax for both Old and New tax regimes in India",
    },
    {
      icon: TrendingUp,
      title: "Expense Tracking",
      description: "Track and categorize your expenses with detailed analytics",
    },
    {
      icon: Brain,
      title: "AI Financial Advisor",
      description: "Get personalized financial advice powered by advanced AI",
    },
    {
      icon: Newspaper,
      title: "Financial News",
      description:
        "Stay updated with the latest financial news and market trends",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <nav className="flex items-center justify-between mb-16">
          <div className="text-2xl font-bold text-primary">FinSight India</div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>

        <div className="text-center max-w-4xl mx-auto mb-20">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            Smart Financial Planning for Indian Professionals
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Calculate taxes, track expenses, and get AI-powered financial
            advice—all in one place. Built specifically for early-career
            professionals in India.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8">
                Start Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/tax-calculator">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Try Calculator
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((feature, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose FinSight India?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>🇮🇳 Built for India</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Designed specifically for Indian tax laws, financial systems,
                  and the needs of young professionals starting their careers.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🤖 AI-Powered Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get personalized financial advice that considers your actual
                  income, expenses, and financial goals using advanced AI.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📊 Complete Visibility</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Track all your expenses in one place with detailed
                  categorization and easy-to-understand analytics.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🔒 Secure & Private</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Your financial data is encrypted and secure. We never share
                  your information with third parties.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center bg-primary text-primary-foreground rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of professionals managing their money smarter.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Create Free Account
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-600">
            © 2026 FinSight India. Built with ❤️ for Indian professionals.
          </p>
        </div>
      </footer>
    </div>
  );
}
