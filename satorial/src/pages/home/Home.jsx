import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
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
} from 'lucide-react';
import Logo from '../../assets/images/Logo.png';

const FadeInWhenVisible = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
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
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (user) {
    return <Navigate to='/dashboard' replace />;
  }

  const features = [
    {
      icon: Users,
      title: 'Client Management',
      description:
        "Manage client profiles, measurements, designs, and order history all in one place. Never lose track of a client's preferences again.",
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: ShoppingBag,
      title: 'Order Tracking',
      description:
        'Track every order from creation to delivery with real-time status updates, payment tracking, and automated notifications.',
      gradient: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50',
    },
    {
      icon: BarChart3,
      title: 'Reports & Analytics',
      description:
        'Gain insights into sales, revenue, expenses, and staff performance with comprehensive visual reports and dashboards.',
      gradient: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      icon: Wallet,
      title: 'Expense Management',
      description:
        'Categorize and track all business expenses. Monitor spending patterns and keep your finances organized effortlessly.',
      gradient: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-50',
    },
    {
      icon: Package,
      title: 'Inventory Control',
      description:
        'Track fabric, materials, and supplies with smart inventory management. Get alerts for low stock and manage dispensing.',
      gradient: 'from-rose-500 to-rose-600',
      bg: 'bg-rose-50',
    },
    {
      icon: UserCheck,
      title: 'Staff & Payroll',
      description:
        'Manage your team with staff profiles, performance tracking, payroll generation, and attendance management.',
      gradient: 'from-indigo-500 to-indigo-600',
      bg: 'bg-indigo-50',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Create Your Account',
      description:
        'Sign up in minutes. Set up your organization profile and customize your workspace to match your brand.',
      icon: Sparkles,
    },
    {
      number: '02',
      title: 'Add Your Data',
      description:
        'Import your clients, inventory, and staff records. Our intuitive forms make setup quick and painless.',
      icon: Users,
    },
    {
      number: '03',
      title: 'Start Managing',
      description:
        'Begin creating orders, tracking payments, and generating reports. Watch your productivity soar instantly.',
      icon: TrendingUp,
    },
  ];

  const testimonials = [
    {
      name: 'Adaeze Okonkwo',
      role: 'Fashion Designer, Lagos',
      quote:
        'Satorial transformed how I run my fashion business. I can now manage 200+ clients without breaking a sweat. The order tracking alone saves me hours every week.',
      rating: 5,
    },
    {
      name: 'Chidinma Eze',
      role: 'Bespoke Tailor, Abuja',
      quote:
        'Before Satorial, I was juggling spreadsheets and notebooks. Now everything is in one place - measurements, orders, payments. My clients are impressed with my professionalism.',
      rating: 5,
    },
    {
      name: 'Oluwaseun Adeyemi',
      role: 'Fashion House Owner, Ibadan',
      quote:
        "The staff management and payroll features are game-changers. I can track my team's performance and generate payroll in minutes. Highly recommend for any fashion business.",
      rating: 5,
    },
  ];

  const benefits = [
    { text: 'Save 10+ hours per week on admin tasks', icon: Clock },
    { text: 'Never miss a client deadline again', icon: Shield },
    { text: 'Reduce errors in measurements & orders', icon: CheckCircle2 },
    { text: 'Grow revenue with better client insights', icon: TrendingUp },
    { text: 'Professional client experience', icon: Star },
    { text: 'Real-time business overview', icon: Zap },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 'Free',
      period: '',
      description: 'Perfect for individual tailors and small shops',
      features: [
        'Up to 50 clients',
        'Basic order management',
        'Expense tracking',
        '1 staff member',
        'Email support',
      ],
      cta: 'Get Started Free',
      highlighted: false,
    },
    {
      name: 'Professional',
      price: '\u20A615,000',
      period: '/month',
      description: 'For growing fashion businesses',
      features: [
        'Unlimited clients',
        'Advanced order tracking',
        'Full inventory management',
        'Up to 10 staff members',
        'Reports & analytics',
        'Payroll management',
        'Priority support',
      ],
      cta: 'Start Free Trial',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large fashion houses and chains',
      features: [
        'Everything in Professional',
        'Unlimited staff',
        'Custom integrations',
        'Dedicated account manager',
        'On-site training',
        'API access',
        'SLA guarantee',
      ],
      cta: 'Contact Sales',
      highlighted: false,
    },
  ];

  return (
    <div className='min-h-screen bg-white'>
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
            : 'bg-transparent'
        }`}
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16 lg:h-20'>
            <Link to='/' className='flex items-center gap-2'>
              <img
                src={Logo}
                alt='Satorial'
                className='h-40 lg:h-48'
                style={{ transform: 'scale(0.85)' }}
              />
            </Link>

            {/* Desktop Nav */}
            <div className='hidden md:flex items-center gap-8'>
              <a
                href='#features'
                className='text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors'
              >
                Features
              </a>
              <a
                href='#how-it-works'
                className='text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors'
              >
                How It Works
              </a>
              <a
                href='#pricing'
                className='text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors'
              >
                Pricing
              </a>
              <a
                href='#testimonials'
                className='text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors'
              >
                Testimonials
              </a>
            </div>

            <div className='hidden md:flex items-center gap-3'>
              <Link
                to='/login'
                className='text-sm font-semibold text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors'
              >
                Log In
              </Link>
              <Link
                to='/register'
                className='text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all'
              >
                Get Started Free
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors'
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
            className='md:hidden bg-white border-t border-gray-100 shadow-lg'
          >
            <div className='px-4 py-4 space-y-1'>
              <a
                href='#features'
                onClick={() => setMobileMenuOpen(false)}
                className='block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg'
              >
                Features
              </a>
              <a
                href='#how-it-works'
                onClick={() => setMobileMenuOpen(false)}
                className='block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg'
              >
                How It Works
              </a>
              <a
                href='#pricing'
                onClick={() => setMobileMenuOpen(false)}
                className='block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg'
              >
                Pricing
              </a>
              <a
                href='#testimonials'
                onClick={() => setMobileMenuOpen(false)}
                className='block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg'
              >
                Testimonials
              </a>
              <div className='pt-3 border-t border-gray-100 space-y-2'>
                <Link
                  to='/login'
                  className='block text-center px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg'
                >
                  Log In
                </Link>
                <Link
                  to='/register'
                  className='block text-center px-4 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg'
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section — Editorial Atelier */}
      <section className='relative pt-24 lg:pt-28 pb-10 lg:pb-12 overflow-hidden bg-[#FCFCF9]'>
        <div className='absolute inset-0 pointer-events-none overflow-hidden'>
          <div className='absolute inset-0 bg-gradient-to-b from-white via-[#FCFCF9] to-white' />
          <div
            className='hero-drift-1 absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full opacity-[0.55] blur-[80px]'
            style={{
              background:
                'radial-gradient(ellipse at center, #DBEAFE 0%, #EDE9FE 45%, transparent 70%)',
            }}
          />
          <div
            className='hero-drift-2 absolute top-24 -left-40 w-[420px] h-[420px] rounded-full opacity-40 blur-[70px]'
            style={{
              background:
                'radial-gradient(ellipse at center, #FEF3C7 0%, #FDF2F8 50%, transparent 70%)',
            }}
          />
          <div
            className='hero-drift-3 absolute bottom-0 right-1/3 w-[600px] h-[300px] rounded-full opacity-30 blur-[60px]'
            style={{
              background:
                'radial-gradient(ellipse at center, #E0E7FF 0%, transparent 70%)',
            }}
          />
          <div
            className='absolute inset-0 opacity-[0.045]'
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, #111827 1px, transparent 0)',
              backgroundSize: '22px 22px',
            }}
          />
          <div className='hidden lg:block absolute left-[calc(50%-640px)] top-24 bottom-10 w-px border-l border-dashed border-gray-200 opacity-60' />
          <div className='hidden lg:block absolute right-[calc(50%-640px)] top-24 bottom-10 w-px border-l border-dashed border-gray-200 opacity-60' />
          <div className='hidden lg:block absolute top-28 left-6 w-8 h-8 border-l-2 border-t-2 border-gray-900/10 rounded-tl-lg' />
          <div className='hidden lg:block absolute top-28 right-6 w-8 h-8 border-r-2 border-t-2 border-gray-900/10 rounded-tr-lg' />
          <div
            className='absolute inset-0 opacity-[0.015]'
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative'>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='flex justify-center lg:justify-start mb-6'
          >
            <div className='inline-flex items-center gap-3 pl-1 pr-4 py-1 bg-white border border-gray-200 rounded-full shadow-sm'>
              <span className='inline-flex items-center gap-1.5 bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full'>
                <span className='w-2 h-2 bg-emerald-400 rounded-full animate-pulse' />
                Live
              </span>
              <span className='text-sm font-medium text-gray-700'>
                Made for tailors, dressmakers & fashion studios
              </span>
            </div>
          </motion.div>

          <div className='grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-10 items-center'>
            <div className='text-center lg:text-left'>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.05 }}
                className='inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-xs font-semibold tracking-wide capitalize text-blue-700 mb-5'
              >
                <Scissors size={12} />
                Built for Fashion Professionals
                <span className='hidden sm:inline w-px h-3 bg-blue-200 mx-1' />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.1 }}
                className='font-extrabold tracking-[-0.03em] text-gray-900 leading-[0.95]'
                style={{ fontSize: 'clamp(2.2rem, 5vw, 4.2rem)' }}
              >
                <span className='block'>The smarter way</span>
                <span className='block'>to run your</span>
                <span className='block'>
                  <span
                    className='italic font-medium tracking-[-0.04em] bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 bg-clip-text text-transparent'
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    Fashion Business
                  </span>
                  <span className='align-baseline ml-2 inline-flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gray-900 text-white -rotate-6 shadow-lg transition-transform duration-300 hover:rotate-0 hover:scale-110'>
                    <Ruler size={16} className='lg:w-[18px] lg:h-[18px]' />
                  </span>
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.18 }}
                className='mt-5 text-[15px] lg:text-lg text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0'
              >
                The all-in-one operating system that powers your fashion
                business — from first fitting to final delivery. Clients,
                orders, inventory & payroll in one calm, beautiful workspace.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.24 }}
                className='mt-8 flex flex-col sm:flex-row items-center lg:items-stretch justify-center lg:justify-start gap-3'
              >
                <Link
                  to='/register'
                  className='group relative inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-7 py-4 rounded-full text-[15px] font-semibold shadow-[0_10px_30px_rgba(0,0,0,0.18)] hover:shadow-[0_14px_36px_rgba(0,0,0,0.22)] transition-all overflow-hidden w-full sm:w-auto'
                >
                  <span className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-blue-600/20 via-violet-600/20 to-blue-600/20' />
                  <span className='relative'>Start free — no card needed</span>
                  <ArrowRight
                    size={18}
                    className='relative group-hover:translate-x-0.5 transition-transform'
                  />
                </Link>
                <a
                  href='#features'
                  className='inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 px-7 py-4 rounded-full text-[15px] font-semibold border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all w-full sm:w-auto'
                >
                  <span className='w-7 h-7 rounded-full bg-gray-900 text-white grid place-items-center'>
                    <ChevronRight size={14} />
                  </span>
                  See how it works
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.32 }}
                className='mt-4 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs text-gray-500'
              >
                <span className='inline-flex items-center gap-1.5'>
                  <CheckCircle2 size={14} className='text-emerald-500' /> Free
                  forever plan
                </span>
                <span className='w-1 h-1 bg-gray-300 rounded-full' />
                <span className='inline-flex items-center gap-1.5'>
                  <Shield size={14} className='text-gray-400' /> No credit card
                </span>
                <span className='w-1 h-1 bg-gray-300 rounded-full' />
                <span className='inline-flex items-center gap-1.5'>
                  <Clock size={14} className='text-gray-400' /> Setup in 3 min
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.38 }}
                className='mt-8 flex items-center justify-center lg:justify-start gap-3'
              >
                <div className='flex -space-x-2'>
                  <img
                    src='https://i.pravatar.cc/64?img=32'
                    alt=''
                    width='32'
                    height='32'
                    loading='eager'
                    decoding='async'
                    fetchPriority='low'
                    className='w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm'
                  />
                  <img
                    src='https://i.pravatar.cc/64?img=47'
                    alt=''
                    width='32'
                    height='32'
                    loading='eager'
                    decoding='async'
                    fetchPriority='low'
                    className='w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm'
                  />
                  <img
                    src='https://i.pravatar.cc/64?img=14'
                    alt=''
                    width='32'
                    height='32'
                    loading='eager'
                    decoding='async'
                    fetchPriority='low'
                    className='w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm'
                  />
                  <img
                    src='https://i.pravatar.cc/64?img=26'
                    alt=''
                    width='32'
                    height='32'
                    loading='eager'
                    decoding='async'
                    fetchPriority='low'
                    className='w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm'
                  />
                </div>
                <div className='text-left'>
                  <div className='flex items-center gap-1'>
                    <Star size={12} className='fill-amber-400 text-amber-400' />
                    <Star size={12} className='fill-amber-400 text-amber-400' />
                    <Star size={12} className='fill-amber-400 text-amber-400' />
                    <Star size={12} className='fill-amber-400 text-amber-400' />
                    <Star size={12} className='fill-amber-400 text-amber-400' />
                    <span className='text-xs font-semibold text-gray-900 ml-1'>
                      5/5
                    </span>
                    <span className='text-xs text-gray-500'>· 10+ reviews</span>
                  </div>
                  <p className='text-xs text-gray-500'>
                    Loved by tailors & fashion teams
                  </p>
                </div>
              </motion.div>
            </div>

            <div className='relative lg:h-[520px] flex items-center justify-center'>
              <div className='absolute inset-x-6 bottom-4 h-24 bg-gradient-to-t from-gray-900/[0.07] to-transparent blur-2xl rounded-full pointer-events-none' />

              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.25, ease: 'easeOut' }}
                className='hero-dash relative w-full max-w-[560px] bg-white rounded-[20px] lg:rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.12),0_1px_0_rgba(0,0,0,0.04)] border border-gray-200 overflow-hidden'
              >
                <div className='flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200'>
                  <div className='flex items-center gap-1.5'>
                    <span className='w-3 h-3 rounded-full bg-red-400' />
                    <span className='w-3 h-3 rounded-full bg-yellow-400' />
                    <span className='w-3 h-3 rounded-full bg-green-400' />
                  </div>
                  <div className='hidden sm:flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-500'>
                    <Shield size={12} className='text-emerald-500' />
                    app.satorial.com/dashboard
                  </div>
                  <div className='flex items-center gap-1.5 text-xs text-gray-400'>
                    <span className='w-2 h-2 bg-emerald-500 rounded-full animate-pulse' />
                    Live
                  </div>
                </div>

                <div className='p-4 lg:p-5 bg-gradient-to-b from-white to-gray-50/60'>
                  <div className='grid grid-cols-4 gap-2 lg:gap-3'>
                    <div className='hero-kpi bg-white rounded-2xl border border-gray-100 p-3 shadow-sm cursor-default'>
                      <div className='flex items-center gap-1.5'>
                        <span className='w-1.5 h-1.5 rounded-full bg-blue-500' />
                        <span className='text-[11px] font-medium text-gray-500'>
                          Clients
                        </span>
                      </div>
                      <p className='text-sm lg:text-base font-bold text-gray-900 mt-1'>
                        1,284
                      </p>
                      <p className='text-[11px] font-medium text-emerald-600'>
                        +12%
                      </p>
                    </div>
                    <div className='hero-kpi bg-white rounded-2xl border border-gray-100 p-3 shadow-sm cursor-default'>
                      <div className='flex items-center gap-1.5'>
                        <span className='w-1.5 h-1.5 rounded-full bg-violet-500' />
                        <span className='text-[11px] font-medium text-gray-500'>
                          Orders
                        </span>
                      </div>
                      <p className='text-sm lg:text-base font-bold text-gray-900 mt-1'>
                        56
                      </p>
                      <p className='text-[11px] font-medium text-emerald-600'>
                        +8%
                      </p>
                    </div>
                    <div className='hero-kpi bg-white rounded-2xl border border-gray-100 p-3 shadow-sm cursor-default'>
                      <div className='flex items-center gap-1.5'>
                        <span className='w-1.5 h-1.5 rounded-full bg-emerald-500' />
                        <span className='text-[11px] font-medium text-gray-500'>
                          Revenue
                        </span>
                      </div>
                      <p className='text-sm lg:text-base font-bold text-gray-900 mt-1'>
                        ₦2.4M
                      </p>
                      <p className='text-[11px] font-medium text-emerald-600'>
                        +24%
                      </p>
                    </div>
                    <div className='hero-kpi bg-white rounded-2xl border border-gray-100 p-3 shadow-sm cursor-default'>
                      <div className='flex items-center gap-1.5'>
                        <span className='w-1.5 h-1.5 rounded-full bg-amber-500' />
                        <span className='text-[11px] font-medium text-gray-500'>
                          Done
                        </span>
                      </div>
                      <p className='text-sm lg:text-base font-bold text-gray-900 mt-1'>
                        892
                      </p>
                      <p className='text-[11px] font-medium text-emerald-600'>
                        +18%
                      </p>
                    </div>
                  </div>

                  <div className='grid grid-cols-[1.4fr_0.9fr] gap-3 mt-3'>
                    <div className='bg-white rounded-2xl border border-gray-100 p-3 lg:p-4'>
                      <div className='flex items-center justify-between mb-3'>
                        <p className='text-xs font-semibold text-gray-900'>
                          Revenue trend
                        </p>
                        <span className='text-[11px] px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full font-medium'>
                          This month
                        </span>
                      </div>
                      <div className='flex items-end gap-1.5 h-[84px]'>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: '38%' }}
                          transition={{
                            duration: 0.7,
                            delay: 0.5,
                            ease: 'easeOut',
                          }}
                          className='hero-bar flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md'
                        />
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: '62%' }}
                          transition={{
                            duration: 0.7,
                            delay: 0.54,
                            ease: 'easeOut',
                          }}
                          className='hero-bar flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md'
                        />
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: '44%' }}
                          transition={{
                            duration: 0.7,
                            delay: 0.58,
                            ease: 'easeOut',
                          }}
                          className='hero-bar flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md'
                        />
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: '78%' }}
                          transition={{
                            duration: 0.7,
                            delay: 0.62,
                            ease: 'easeOut',
                          }}
                          className='hero-bar flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md'
                        />
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: '52%' }}
                          transition={{
                            duration: 0.7,
                            delay: 0.66,
                            ease: 'easeOut',
                          }}
                          className='hero-bar flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md'
                        />
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: '88%' }}
                          transition={{
                            duration: 0.7,
                            delay: 0.7,
                            ease: 'easeOut',
                          }}
                          className='hero-bar flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md'
                        />
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: '66%' }}
                          transition={{
                            duration: 0.7,
                            delay: 0.74,
                            ease: 'easeOut',
                          }}
                          className='hero-bar flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md'
                        />
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: '84%' }}
                          transition={{
                            duration: 0.7,
                            delay: 0.78,
                            ease: 'easeOut',
                          }}
                          className='hero-bar flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md'
                        />
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: '58%' }}
                          transition={{
                            duration: 0.7,
                            delay: 0.82,
                            ease: 'easeOut',
                          }}
                          className='hero-bar flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md'
                        />
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: '92%' }}
                          transition={{
                            duration: 0.7,
                            delay: 0.86,
                            ease: 'easeOut',
                          }}
                          className='hero-bar flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md'
                        />
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: '72%' }}
                          transition={{
                            duration: 0.7,
                            delay: 0.9,
                            ease: 'easeOut',
                          }}
                          className='hero-bar flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md'
                        />
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: '86%' }}
                          transition={{
                            duration: 0.7,
                            delay: 0.94,
                            ease: 'easeOut',
                          }}
                          className='hero-bar flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md'
                        />
                      </div>
                      <div className='mt-2 flex justify-between text-[10px] text-gray-400'>
                        <span>Jan</span>
                        <span>Apr</span>
                        <span>Aug</span>
                        <span>Dec</span>
                      </div>
                    </div>
                    <div className='bg-white rounded-2xl border border-gray-100 p-3 lg:p-4'>
                      <p className='text-xs font-semibold text-gray-900'>
                        Recent orders
                      </p>
                      <div className='mt-3 space-y-2.5'>
                        <div className='hero-row flex items-center gap-2 rounded-xl -mx-1 px-1 py-1'>
                          <div className='w-7 h-7 rounded-full bg-gray-900 text-white grid place-items-center text-[10px] font-bold'>
                            A
                          </div>
                          <div className='flex-1 min-w-0'>
                            <p className='text-xs font-medium text-gray-900 truncate'>
                              Adeola · Agbada
                            </p>
                            <p className='text-[11px] text-gray-500'>
                              Due Apr 18
                            </p>
                          </div>
                          <span className='text-[10px] font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 whitespace-nowrap'>
                            Cutting
                          </span>
                        </div>
                        <div className='hero-row flex items-center gap-2 rounded-xl -mx-1 px-1 py-1'>
                          <div className='w-7 h-7 rounded-full bg-gray-900 text-white grid place-items-center text-[10px] font-bold'>
                            B
                          </div>
                          <div className='flex-1 min-w-0'>
                            <p className='text-xs font-medium text-gray-900 truncate'>
                              Bimpe · Gown
                            </p>
                            <p className='text-[11px] text-gray-500'>
                              Due Apr 20
                            </p>
                          </div>
                          <span className='text-[10px] font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 whitespace-nowrap'>
                            Stitching
                          </span>
                        </div>
                        <div className='hero-row flex items-center gap-2 rounded-xl -mx-1 px-1 py-1'>
                          <div className='w-7 h-7 rounded-full bg-gray-900 text-white grid place-items-center text-[10px] font-bold'>
                            C
                          </div>
                          <div className='flex-1 min-w-0'>
                            <p className='text-xs font-medium text-gray-900 truncate'>
                              Chidi · Suit
                            </p>
                            <p className='text-[11px] text-gray-500'>
                              Due Apr 22
                            </p>
                          </div>
                          <span className='text-[10px] font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 whitespace-nowrap'>
                            Fitting
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='mt-3 flex items-center gap-2 bg-white rounded-full border border-gray-100 px-3 py-2 shadow-sm'>
                    <span className='text-[11px] font-semibold text-gray-700 flex items-center gap-1.5'>
                      <Sparkles size={12} className='text-amber-500' /> Palette
                      today
                    </span>
                    <span className='flex-1 h-px bg-gray-100 mx-2 hidden sm:block' />
                    <div className='flex items-center gap-1.5'>
                      <span
                        className='hero-swatch w-5 h-5 rounded-full border border-white shadow-sm ring-1 ring-gray-200 cursor-pointer'
                        style={{ background: '#111827' }}
                      />
                      <span
                        className='hero-swatch w-5 h-5 rounded-full border border-white shadow-sm ring-1 ring-gray-200 cursor-pointer'
                        style={{ background: '#2563EB' }}
                      />
                      <span
                        className='hero-swatch w-5 h-5 rounded-full border border-white shadow-sm ring-1 ring-gray-200 cursor-pointer'
                        style={{ background: '#F59E0B' }}
                      />
                      <span
                        className='hero-swatch w-5 h-5 rounded-full border border-white shadow-sm ring-1 ring-gray-200 cursor-pointer'
                        style={{ background: '#EC4899' }}
                      />
                      <span
                        className='hero-swatch w-5 h-5 rounded-full border border-white shadow-sm ring-1 ring-gray-200 cursor-pointer'
                        style={{ background: '#10B981' }}
                      />
                      <span
                        className='hero-swatch w-5 h-5 rounded-full border border-white shadow-sm ring-1 ring-gray-200 cursor-pointer'
                        style={{ background: '#E5E7EB' }}
                      />
                    </div>
                    <span className='hidden lg:inline text-xs text-gray-500 ml-1'>
                      Aso Oke · Lace · Ankara
                    </span>
                  </div>
                </div>

                <div className='h-6 bg-[repeating-linear-gradient(90deg,#111827_0_8px,transparent_8px_16px)] opacity-[0.06] bg-[length:32px_100%] hover:opacity-[0.09] transition-opacity duration-300' />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10, x: 10 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className='flex absolute -right-1 sm:-right-2 top-1 sm:top-4 lg:-right-2 lg:top-6 z-10'
              >
                <motion.div
                  animate={{
                    y: [0, -14, -8, 0],
                    x: [0, 5, -6, 0],
                    rotate: [1.2, 2.4, 0.6, 1.2],
                  }}
                  transition={{
                    duration: 3.6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1,
                  }}
                  style={{ willChange: 'transform' }}
                  className='flex bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-gray-100 p-3 items-center gap-3'
                >
                  <div className='w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 grid place-items-center text-white shadow-md'>
                    <ShoppingBag size={16} />
                  </div>
                  <div>
                    <p className='text-xs font-semibold text-gray-900'>
                      New order — Amaka
                    </p>
                    <p className='text-xs text-gray-500'>
                      Aso Oke Agbada · ₦85,000
                    </p>
                  </div>
                  <span className='ml-2 w-2 h-2 bg-emerald-500 rounded-full animate-pulse' />
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10, x: -10 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className='flex absolute -left-1 sm:-left-2 -bottom-1 sm:bottom-2 lg:-left-4 lg:bottom-16 z-10'
              >
                <div className='hero-still flex bg-gray-900 text-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.22)] border border-white/10 p-3 items-center gap-3 cursor-default'>
                  <div className='w-10 h-10 rounded-full bg-white/10 border border-white/15 grid place-items-center'>
                    <Ruler size={16} />
                  </div>
                  <div>
                    <p className='text-xs font-semibold'>Measurements saved</p>
                    <p className='text-xs text-white/70'>
                      Chest 42" · Waist 34" · Perfect fit
                    </p>
                  </div>
                  <CheckCircle2 size={16} className='text-emerald-400 ml-1' />
                </div>
              </motion.div>

              <div className='hidden lg:block absolute -right-6 bottom-28 w-16 h-16 rounded-full border border-gray-200 bg-white/60 backdrop-blur shadow-sm pointer-events-none hero-float-a' />
              <div className='hidden lg:block absolute -left-8 top-20 w-10 h-10 rounded-full bg-blue-600/10 border border-blue-200 pointer-events-none hero-float-b' />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className='mt-10 lg:mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-gray-500'
          >
            <span className='hero-pill inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm'>
              <span className='w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 grid place-items-center'>
                <Zap size={12} className='text-emerald-600' />
              </span>
              Works offline. Syncs when back.
            </span>
            <span className='hero-pill inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm'>
              <span className='w-6 h-6 rounded-full bg-blue-50 border border-blue-100 grid place-items-center'>
                <Users size={12} className='text-blue-600' />
              </span>
              Invite your team — roles & permissions
            </span>
            <span className='hero-pill inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm'>
              <span className='w-6 h-6 rounded-full bg-amber-50 border border-amber-100 grid place-items-center'>
                <Package size={12} className='text-amber-600' />
              </span>
              Inventory that warns before you run out
            </span>
          </motion.div>
        </div>

        <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent' />
        </div>
      </section>
      {/* Stats Bar */}
      <section className='bg-gray-900 py-12 lg:py-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-8 text-center'>
            {[
              { value: '2,000+', label: 'Fashion Businesses' },
              { value: '50,000+', label: 'Orders Managed' },
              { value: '98%', label: 'Customer Satisfaction' },
              { value: '10hrs+', label: 'Saved Weekly' },
            ].map((stat, i) => (
              <FadeInWhenVisible key={i} delay={i * 0.1}>
                <p className='text-3xl lg:text-4xl font-bold text-white'>
                  {stat.value}
                </p>
                <p className='text-sm text-gray-400 mt-1 font-medium'>
                  {stat.label}
                </p>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id='features' className='py-20 lg:py-28 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <FadeInWhenVisible className='text-center max-w-3xl mx-auto mb-16'>
            <span className='inline-block text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full mb-4'>
              Features
            </span>
            <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900'>
              Everything You Need to Run Your Fashion Business
            </h2>
            <p className='mt-4 text-lg text-gray-600'>
              Satorial brings all your business operations into one easy-to-use
              platform designed specifically for fashion professionals.
            </p>
          </FadeInWhenVisible>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8'>
            {features.map((feature, i) => (
              <FadeInWhenVisible key={i} delay={i * 0.1}>
                <div className='group bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 h-full'>
                  <div
                    className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon
                      size={22}
                      className={`text-${feature.gradient.split('-')[1]}-600`}
                    />
                  </div>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    {feature.title}
                  </h3>
                  <p className='text-gray-600 text-sm leading-relaxed'>
                    {feature.description}
                  </p>
                </div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id='how-it-works' className='py-20 lg:py-28 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <FadeInWhenVisible className='text-center max-w-3xl mx-auto mb-16'>
            <span className='inline-block text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full mb-4'>
              How It Works
            </span>
            <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900'>
              Get Started in Minutes
            </h2>
            <p className='mt-4 text-lg text-gray-600'>
              Setting up Satorial is quick and easy. Start managing your fashion
              business like a pro in three simple steps.
            </p>
          </FadeInWhenVisible>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12'>
            {steps.map((step, i) => (
              <FadeInWhenVisible key={i} delay={i * 0.15}>
                <div className='relative text-center'>
                  <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white mb-6 shadow-lg shadow-blue-500/25'>
                    <step.icon size={28} />
                  </div>
                  <div className='absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-blue-200 hidden md:block last:hidden' />
                  <p className='text-sm font-bold text-blue-600 mb-2'>
                    Step {step.number}
                  </p>
                  <h3 className='text-xl font-semibold text-gray-900 mb-3'>
                    {step.title}
                  </h3>
                  <p className='text-gray-600 text-sm leading-relaxed max-w-sm mx-auto'>
                    {step.description}
                  </p>
                </div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* Why Satorial */}
      <section className='py-20 lg:py-28 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center'>
            <FadeInWhenVisible>
              <span className='inline-block text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full mb-4'>
                Why Satorial?
              </span>
              <h2 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-6'>
                Built by Fashion Professionals, for Fashion Professionals
              </h2>
              <p className='text-gray-600 mb-8 leading-relaxed'>
                We understand the unique challenges of running a fashion
                business. Satorial was designed from the ground up to address
                the specific needs of tailors, fashion designers, and bespoke
                clothing businesses.
              </p>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                {benefits.map((benefit, i) => (
                  <div key={i} className='flex items-center gap-3'>
                    <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <benefit.icon size={16} className='text-blue-600' />
                    </div>
                    <span className='text-sm font-medium text-gray-700'>
                      {benefit.text}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                to='/register'
                className='group inline-flex items-center gap-2 mt-8 text-blue-600 font-semibold hover:text-blue-700 transition-colors'
              >
                Start your free trial
                <ChevronRight
                  size={16}
                  className='group-hover:translate-x-0.5 transition-transform'
                />
              </Link>
            </FadeInWhenVisible>

            <FadeInWhenVisible delay={0.2}>
              <div className='bg-white rounded-2xl p-8 shadow-xl border border-gray-100'>
                {/* Mock client profile */}
                <div className='flex items-center gap-4 mb-6 pb-6 border-b border-gray-100'>
                  <div className='w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold'>
                    AO
                  </div>
                  <div>
                    <h4 className='font-semibold text-gray-900'>
                      Adeola Okafor
                    </h4>
                    <p className='text-sm text-gray-500'>
                      Premium Client since 2024
                    </p>
                  </div>
                </div>
                <div className='space-y-4'>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-gray-500'>Total Orders</span>
                    <span className='text-sm font-semibold text-gray-900'>
                      24
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-gray-500'>Total Revenue</span>
                    <span className='text-sm font-semibold text-gray-900'>
                      {'\u20A6'}1,250,000
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-gray-500'>Active Orders</span>
                    <span className='text-sm font-semibold text-gray-900'>
                      3
                    </span>
                  </div>
                  <div className='pt-4 border-t border-gray-100'>
                    <p className='text-xs text-gray-500 mb-2 font-medium'>
                      Measurements
                    </p>
                    <div className='grid grid-cols-3 gap-2'>
                      {[
                        { label: 'Chest', val: '42"' },
                        { label: 'Waist', val: '34"' },
                        { label: 'Hips', val: '40"' },
                        { label: 'Shoulder', val: '18"' },
                        { label: 'Sleeve', val: '25"' },
                        { label: 'Length', val: '30"' },
                      ].map((m, i) => (
                        <div
                          key={i}
                          className='bg-gray-50 rounded-lg p-2 text-center'
                        >
                          <p className='text-xs text-gray-500'>{m.label}</p>
                          <p className='text-sm font-semibold text-gray-900'>
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
      <section id='testimonials' className='py-20 lg:py-28 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <FadeInWhenVisible className='text-center max-w-3xl mx-auto mb-16'>
            <span className='inline-block text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full mb-4'>
              Testimonials
            </span>
            <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900'>
              Loved by Fashion Businesses
            </h2>
            <p className='mt-4 text-lg text-gray-600'>
              Hear from fashion professionals who have transformed their
              businesses with Satorial.
            </p>
          </FadeInWhenVisible>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8'>
            {testimonials.map((testimonial, i) => (
              <FadeInWhenVisible key={i} delay={i * 0.1}>
                <div className='bg-gray-50 rounded-2xl p-6 lg:p-8 border border-gray-100 h-full flex flex-col'>
                  <div className='flex gap-1 mb-4'>
                    {Array.from({ length: testimonial.rating }).map((_, j) => (
                      <Star
                        key={j}
                        size={16}
                        className='text-amber-400 fill-amber-400'
                      />
                    ))}
                  </div>
                  <p className='text-gray-700 text-sm leading-relaxed flex-1 mb-6'>
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className='flex items-center gap-3 pt-4 border-t border-gray-200'>
                    <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold'>
                      {testimonial.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <p className='text-sm font-semibold text-gray-900'>
                        {testimonial.name}
                      </p>
                      <p className='text-xs text-gray-500'>
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
      <section id='pricing' className='py-20 lg:py-28 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <FadeInWhenVisible className='text-center max-w-3xl mx-auto mb-16'>
            <span className='inline-block text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full mb-4'>
              Pricing
            </span>
            <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900'>
              Simple, Transparent Pricing
            </h2>
            <p className='mt-4 text-lg text-gray-600'>
              Choose the plan that fits your business. Start free and upgrade as
              you grow.
            </p>
          </FadeInWhenVisible>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto'>
            {pricingPlans.map((plan, i) => (
              <FadeInWhenVisible key={i} delay={i * 0.1}>
                <div
                  className={`rounded-2xl p-6 lg:p-8 h-full flex flex-col ${
                    plan.highlighted
                      ? 'bg-gray-900 text-white ring-2 ring-blue-500 shadow-2xl relative'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  {plan.highlighted && (
                    <div className='absolute -top-4 left-1/2 -translate-x-1/2'>
                      <span className='bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full'>
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className='mb-6'>
                    <h3
                      className={`text-lg font-semibold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}
                    >
                      {plan.name}
                    </h3>
                    <div className='mt-3 flex items-baseline gap-1'>
                      <span
                        className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}
                      >
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span
                          className={`text-sm ${plan.highlighted ? 'text-gray-400' : 'text-gray-500'}`}
                        >
                          {plan.period}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-sm mt-2 ${plan.highlighted ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      {plan.description}
                    </p>
                  </div>
                  <ul className='space-y-3 mb-8 flex-1'>
                    {plan.features.map((feature, j) => (
                      <li key={j} className='flex items-center gap-3'>
                        <CheckCircle2
                          size={16}
                          className={
                            plan.highlighted
                              ? 'text-blue-400 flex-shrink-0'
                              : 'text-blue-600 flex-shrink-0'
                          }
                        />
                        <span
                          className={`text-sm ${plan.highlighted ? 'text-gray-300' : 'text-gray-600'}`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to='/register'
                    className={`block text-center py-3 px-6 rounded-xl text-sm font-semibold transition-all ${
                      plan.highlighted
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
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
      <section className='py-20 lg:py-28 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <FadeInWhenVisible>
            <div className='bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-10 lg:p-16 text-center relative overflow-hidden'>
              <div className='absolute inset-0 overflow-hidden pointer-events-none'>
                <div className='absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-2xl' />
                <div className='absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-2xl' />
              </div>
              <div className='relative'>
                <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4'>
                  Ready to Transform Your Fashion Business?
                </h2>
                <p className='text-blue-100 text-lg max-w-2xl mx-auto mb-8'>
                  Join thousands of fashion professionals who are already using
                  Satorial to streamline operations, delight clients, and grow
                  revenue.
                </p>
                <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
                  <Link
                    to='/register'
                    className='group inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-xl text-base font-semibold hover:bg-blue-50 transition-all shadow-lg'
                  >
                    Get Started Free
                    <ArrowRight
                      size={18}
                      className='group-hover:translate-x-0.5 transition-transform'
                    />
                  </Link>
                  <Link
                    to='/login'
                    className='inline-flex items-center gap-2 text-white/90 hover:text-white px-8 py-4 rounded-xl text-base font-semibold border border-white/20 hover:border-white/40 transition-all'
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
      <footer className='bg-gray-900 pt-16 pb-8'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-gray-800'>
            <div className='col-span-2 md:col-span-1'>
              <Link to='/' className='flex items-center gap-2 mb-4'>
                <img
                  src={Logo}
                  alt='Satorial'
                  className='h-8 brightness-0 invert'
                />
                <span className='text-xl font-bold text-white'>Satorial</span>
              </Link>
              <p className='text-sm text-gray-400 leading-relaxed'>
                The all-in-one business management platform built for fashion
                professionals.
              </p>
            </div>
            <div>
              <h4 className='text-sm font-semibold text-white mb-4'>Product</h4>
              <ul className='space-y-3'>
                {['Features', 'Pricing', 'Integrations', 'Updates'].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href={`#${item.toLowerCase()}`}
                        className='text-sm text-gray-400 hover:text-white transition-colors'
                      >
                        {item}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>
            <div>
              <h4 className='text-sm font-semibold text-white mb-4'>Company</h4>
              <ul className='space-y-3'>
                {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                  <li key={item}>
                    <a
                      href='#'
                      className='text-sm text-gray-400 hover:text-white transition-colors'
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className='text-sm font-semibold text-white mb-4'>Support</h4>
              <ul className='space-y-3'>
                {[
                  'Help Center',
                  'Documentation',
                  'API Reference',
                  'Status',
                ].map((item) => (
                  <li key={item}>
                    <a
                      href='#'
                      className='text-sm text-gray-400 hover:text-white transition-colors'
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className='flex flex-col md:flex-row items-center justify-between pt-8 gap-4'>
            <p className='text-sm text-gray-500'>
              &copy; {new Date().getFullYear()} Satorial. All rights reserved.
            </p>
            <div className='flex items-center gap-6'>
              <a
                href='#'
                className='text-sm text-gray-500 hover:text-gray-300 transition-colors'
              >
                Privacy Policy
              </a>
              <a
                href='#'
                className='text-sm text-gray-500 hover:text-gray-300 transition-colors'
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
