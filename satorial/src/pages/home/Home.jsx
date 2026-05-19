import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Menu,
  X,
  ArrowRight,
  Users,
  ShoppingBag,
  BarChart3,
  Wallet,
  Package,
  UserCheck,
  CheckCircle2,
  Star,
  Zap,
  Shield,
  Clock,
  TrendingUp,
  ChevronRight,
  Scissors,
  Ruler,
  Sparkles,
} from "lucide-react";
import Logo from "../../assets/images/Logo.png";

const FadeInWhenVisible = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const LandingPage = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: Users,
      title: "Client Management",
      description:
        "Manage client profiles, measurements, designs, and order history all in one place. Never lose track of a client's preferences again.",
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: ShoppingBag,
      title: "Order Tracking",
      description:
        "Track every order from creation to delivery with real-time status updates, payment tracking, and automated notifications.",
      gradient: "from-purple-500 to-purple-600",
      bg: "bg-purple-50",
    },
    {
      icon: BarChart3,
      title: "Reports & Analytics",
      description:
        "Gain insights into sales, revenue, expenses, and staff performance with comprehensive visual reports and dashboards.",
      gradient: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      icon: Wallet,
      title: "Expense Management",
      description:
        "Categorize and track all business expenses. Monitor spending patterns and keep your finances organized effortlessly.",
      gradient: "from-amber-500 to-amber-600",
      bg: "bg-amber-50",
    },
    {
      icon: Package,
      title: "Inventory Control",
      description:
        "Track fabric, materials, and supplies with smart inventory management. Get alerts for low stock and manage dispensing.",
      gradient: "from-rose-500 to-rose-600",
      bg: "bg-rose-50",
    },
    {
      icon: UserCheck,
      title: "Staff & Payroll",
      description:
        "Manage your team with staff profiles, performance tracking, payroll generation, and attendance management.",
      gradient: "from-indigo-500 to-indigo-600",
      bg: "bg-indigo-50",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Create Your Account",
      description:
        "Sign up in minutes. Set up your organization profile and customize your workspace to match your brand.",
      icon: Sparkles,
    },
    {
      number: "02",
      title: "Add Your Data",
      description:
        "Import your clients, inventory, and staff records. Our intuitive forms make setup quick and painless.",
      icon: Users,
    },
    {
      number: "03",
      title: "Start Managing",
      description:
        "Begin creating orders, tracking payments, and generating reports. Watch your productivity soar instantly.",
      icon: TrendingUp,
    },
  ];

  const testimonials = [
    {
      name: "Adaeze Okonkwo",
      role: "Fashion Designer, Lagos",
      quote:
        "Satorial transformed how I run my fashion business. I can now manage 200+ clients without breaking a sweat. The order tracking alone saves me hours every week.",
      rating: 5,
    },
    {
      name: "Chidinma Eze",
      role: "Bespoke Tailor, Abuja",
      quote:
        "Before Satorial, I was juggling spreadsheets and notebooks. Now everything is in one place - measurements, orders, payments. My clients are impressed with my professionalism.",
      rating: 5,
    },
    {
      name: "Oluwaseun Adeyemi",
      role: "Fashion House Owner, Ibadan",
      quote:
        "The staff management and payroll features are game-changers. I can track my team's performance and generate payroll in minutes. Highly recommend for any fashion business.",
      rating: 5,
    },
  ];

  const benefits = [
    { text: "Save 10+ hours per week on admin tasks", icon: Clock },
    { text: "Never miss a client deadline again", icon: Shield },
    { text: "Reduce errors in measurements & orders", icon: CheckCircle2 },
    { text: "Grow revenue with better client insights", icon: TrendingUp },
    { text: "Professional client experience", icon: Star },
    { text: "Real-time business overview", icon: Zap },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "Free",
      period: "",
      description: "Perfect for individual tailors and small shops",
      features: [
        "Up to 50 clients",
        "Basic order management",
        "Expense tracking",
        "1 staff member",
        "Email support",
      ],
      cta: "Get Started Free",
      highlighted: false,
    },
    {
      name: "Professional",
      price: "\u20A615,000",
      period: "/month",
      description: "For growing fashion businesses",
      features: [
        "Unlimited clients",
        "Advanced order tracking",
        "Full inventory management",
        "Up to 10 staff members",
        "Reports & analytics",
        "Payroll management",
        "Priority support",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large fashion houses and chains",
      features: [
        "Everything in Professional",
        "Unlimited staff",
        "Custom integrations",
        "Dedicated account manager",
        "On-site training",
        "API access",
        "SLA guarantee",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link to="/" className="flex items-center gap-2">
              <img src={Logo} alt="Satorial" className="h-40 lg:h-48" style={{ transform: 'scale(0.85)' }} />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                How It Works
              </a>
              <a
                href="#pricing"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Testimonials
              </a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-semibold text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all"
              >
                Get Started Free
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-t border-gray-100 shadow-lg"
          >
            <div className="px-4 py-4 space-y-1">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                How It Works
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                Testimonials
              </a>
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <Link
                  to="/login"
                  className="block text-center px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="block text-center px-4 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 lg:pt-36 pb-20 lg:pb-32 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full opacity-40 blur-3xl" />
          <div className="absolute top-20 -left-20 w-72 h-72 bg-purple-100 rounded-full opacity-30 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-sm font-medium text-blue-700 mb-6">
                <Scissors size={14} />
                Built for Fashion Professionals
              </div>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              The Smarter Way to{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Manage Your Fashion Business
              </span>
            </motion.h1>

            <motion.p
              className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              From client measurements to order delivery, Satorial gives you
              everything you need to run a professional fashion business.
              Manage clients, track orders, control inventory, and grow your
              revenue — all from one powerful dashboard.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-base font-semibold shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 transition-all"
              >
                Start Free Trial
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 px-8 py-4 rounded-xl text-base font-semibold border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
              >
                See Features
              </a>
            </motion.div>

            <motion.p
              className="mt-4 text-sm text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              No credit card required. Free plan available forever.
            </motion.p>
          </div>

          {/* Dashboard Preview */}
          <motion.div
            className="mt-16 lg:mt-20 max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <div className="relative rounded-xl lg:rounded-2xl overflow-hidden shadow-2xl shadow-gray-900/10 border border-gray-200">
              {/* Browser chrome */}
              <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 ml-4">
                  <div className="bg-white rounded-md px-4 py-1.5 text-xs text-gray-400 max-w-md mx-auto border border-gray-200">
                    app.satorial.com/dashboard
                  </div>
                </div>
              </div>
              {/* Mock dashboard content */}
              <div className="bg-gray-50 p-6 lg:p-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    {
                      label: "Total Clients",
                      value: "1,284",
                      change: "+12%",
                      color: "blue",
                    },
                    {
                      label: "Active Orders",
                      value: "56",
                      change: "+8%",
                      color: "purple",
                    },
                    {
                      label: "Revenue",
                      value: "\u20A62.4M",
                      change: "+24%",
                      color: "emerald",
                    },
                    {
                      label: "Completed",
                      value: "892",
                      change: "+18%",
                      color: "amber",
                    },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl p-4 border border-gray-100"
                    >
                      <p className="text-xs text-gray-500 font-medium">
                        {stat.label}
                      </p>
                      <p className="text-xl lg:text-2xl font-bold text-gray-900 mt-1">
                        {stat.value}
                      </p>
                      <span
                        className={`text-xs font-medium text-${stat.color}-600`}
                      >
                        {stat.change} this month
                      </span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 bg-white rounded-xl p-4 border border-gray-100 h-40 flex items-center justify-center">
                    <div className="flex items-end gap-2 h-24">
                      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map(
                        (h, i) => (
                          <div
                            key={i}
                            className="w-6 lg:w-8 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                            style={{ height: `${h}%` }}
                          />
                        )
                      )}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 mb-3">
                      Recent Orders
                    </p>
                    {["Adeola - Agbada", "Bimpe - Gown", "Chidi - Suit"].map(
                      (order, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                        >
                          <span className="text-xs text-gray-600">{order}</span>
                          <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">
                            In Progress
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-gray-900 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: "2,000+", label: "Fashion Businesses" },
              { value: "50,000+", label: "Orders Managed" },
              { value: "98%", label: "Customer Satisfaction" },
              { value: "10hrs+", label: "Saved Weekly" },
            ].map((stat, i) => (
              <FadeInWhenVisible key={i} delay={i * 0.1}>
                <p className="text-3xl lg:text-4xl font-bold text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-400 mt-1 font-medium">
                  {stat.label}
                </p>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full mb-4">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              Everything You Need to Run Your Fashion Business
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Satorial brings all your business operations into one
              easy-to-use platform designed specifically for fashion
              professionals.
            </p>
          </FadeInWhenVisible>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, i) => (
              <FadeInWhenVisible key={i} delay={i * 0.1}>
                <div className="group bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 h-full">
                  <div
                    className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon
                      size={22}
                      className={`text-${feature.gradient.split("-")[1]}-600`}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full mb-4">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              Get Started in Minutes
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Setting up Satorial is quick and easy. Start managing your
              fashion business like a pro in three simple steps.
            </p>
          </FadeInWhenVisible>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, i) => (
              <FadeInWhenVisible key={i} delay={i * 0.15}>
                <div className="relative text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white mb-6 shadow-lg shadow-blue-500/25">
                    <step.icon size={28} />
                  </div>
                  <div className="absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-blue-200 hidden md:block last:hidden" />
                  <p className="text-sm font-bold text-blue-600 mb-2">
                    Step {step.number}
                  </p>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed max-w-sm mx-auto">
                    {step.description}
                  </p>
                </div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* Why Satorial */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <FadeInWhenVisible>
              <span className="inline-block text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full mb-4">
                Why Satorial?
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Built by Fashion Professionals, for Fashion Professionals
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                We understand the unique challenges of running a fashion
                business. Satorial was designed from the ground up to address
                the specific needs of tailors, fashion designers, and bespoke
                clothing businesses.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <benefit.icon size={16} className="text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {benefit.text}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 mt-8 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                Start your free trial
                <ChevronRight
                  size={16}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </Link>
            </FadeInWhenVisible>

            <FadeInWhenVisible delay={0.2}>
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                {/* Mock client profile */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                    AO
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Adeola Okafor
                    </h4>
                    <p className="text-sm text-gray-500">
                      Premium Client since 2024
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Total Orders</span>
                    <span className="text-sm font-semibold text-gray-900">
                      24
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Total Revenue
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {"\u20A6"}1,250,000
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Active Orders
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      3
                    </span>
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2 font-medium">
                      Measurements
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Chest", val: '42"' },
                        { label: "Waist", val: '34"' },
                        { label: "Hips", val: '40"' },
                        { label: "Shoulder", val: '18"' },
                        { label: "Sleeve", val: '25"' },
                        { label: "Length", val: '30"' },
                      ].map((m, i) => (
                        <div
                          key={i}
                          className="bg-gray-50 rounded-lg p-2 text-center"
                        >
                          <p className="text-xs text-gray-500">{m.label}</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {m.val}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </FadeInWhenVisible>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              Loved by Fashion Businesses
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Hear from fashion professionals who have transformed their
              businesses with Satorial.
            </p>
          </FadeInWhenVisible>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, i) => (
              <FadeInWhenVisible key={i} delay={i * 0.1}>
                <div className="bg-gray-50 rounded-2xl p-6 lg:p-8 border border-gray-100 h-full flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, j) => (
                      <Star
                        key={j}
                        size={16}
                        className="text-amber-400 fill-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed flex-1 mb-6">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full mb-4">
              Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Choose the plan that fits your business. Start free and upgrade
              as you grow.
            </p>
          </FadeInWhenVisible>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <FadeInWhenVisible key={i} delay={i * 0.1}>
                <div
                  className={`rounded-2xl p-6 lg:p-8 h-full flex flex-col ${
                    plan.highlighted
                      ? "bg-gray-900 text-white ring-2 ring-blue-500 shadow-2xl relative"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="mb-6">
                    <h3
                      className={`text-lg font-semibold ${plan.highlighted ? "text-white" : "text-gray-900"}`}
                    >
                      {plan.name}
                    </h3>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span
                        className={`text-4xl font-bold ${plan.highlighted ? "text-white" : "text-gray-900"}`}
                      >
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span
                          className={`text-sm ${plan.highlighted ? "text-gray-400" : "text-gray-500"}`}
                        >
                          {plan.period}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-sm mt-2 ${plan.highlighted ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {plan.description}
                    </p>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-3">
                        <CheckCircle2
                          size={16}
                          className={
                            plan.highlighted
                              ? "text-blue-400 flex-shrink-0"
                              : "text-blue-600 flex-shrink-0"
                          }
                        />
                        <span
                          className={`text-sm ${plan.highlighted ? "text-gray-300" : "text-gray-600"}`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/register"
                    className={`block text-center py-3 px-6 rounded-xl text-sm font-semibold transition-all ${
                      plan.highlighted
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                        : "bg-gray-900 hover:bg-gray-800 text-white"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible>
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-10 lg:p-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
              </div>
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                  Ready to Transform Your Fashion Business?
                </h2>
                <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8">
                  Join thousands of fashion professionals who are already
                  using Satorial to streamline operations, delight clients,
                  and grow revenue.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    to="/register"
                    className="group inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-xl text-base font-semibold hover:bg-blue-50 transition-all shadow-lg"
                  >
                    Get Started Free
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-white/90 hover:text-white px-8 py-4 rounded-xl text-base font-semibold border border-white/20 hover:border-white/40 transition-all"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-gray-800">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <img src={Logo} alt="Satorial" className="h-8 brightness-0 invert" />
                <span className="text-xl font-bold text-white">Satorial</span>
              </Link>
              <p className="text-sm text-gray-400 leading-relaxed">
                The all-in-one business management platform built for fashion
                professionals.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">
                Product
              </h4>
              <ul className="space-y-3">
                {["Features", "Pricing", "Integrations", "Updates"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href={`#${item.toLowerCase()}`}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">
                Company
              </h4>
              <ul className="space-y-3">
                {["About", "Blog", "Careers", "Contact"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">
                Support
              </h4>
              <ul className="space-y-3">
                {["Help Center", "Documentation", "API Reference", "Status"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 gap-4">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Satorial. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
