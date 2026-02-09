import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {useAuth} from "../../context/AuthContext";
import ModalBlank from "../../components/ModalBlank";
import {
  Bell,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Home,
  Wrench,
  ChevronRight,
  ExternalLink,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Shield,
  FileText,
  Star,
  AlertTriangle,
  MapPin,
  Users,
  MessageCircle,
  BookOpen,
  Hammer,
  ThumbsUp,
  Plus,
  Camera,
  ClipboardList,
  Settings,
  Zap,
  Award,
  Target,
  ChevronLeft,
  X,
  Search,
  Filter,
  MoreVertical,
  Phone,
  Mail,
} from "lucide-react";

// Mock data
const mockPropertyData = {
  id: "HPS-100234",
  address: "1234 Maplewood Lane",
  city: "Anytown",
  state: "CA",
  zip: "12345",
  hpsScore: 87,
  scoreChange: +3,
  healthProgress: {
    identity: 95,
    condition: 72,
    maintenance: 80,
  },
  mainPhoto:
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80",
  agent: {
    name: "Marcus Reed",
    company: "HomeOps Realty",
    phone: "(555) 123-4567",
    email: "marcus.reed@homeops.com",
  },
  nextAction: {
    title: "HVAC Service Due",
    daysUntil: 5,
    type: "maintenance",
  },
  reminders: [
    {
      id: 1,
      type: "maintenance",
      title: "HVAC Service Due",
      date: "2024-01-15",
      priority: "high",
      status: "pending",
    },
    {
      id: 2,
      type: "document",
      title: "Insurance Renewal",
      date: "2024-02-01",
      priority: "medium",
      status: "pending",
    },
    {
      id: 3,
      type: "maintenance",
      title: "Gutter Cleaning",
      date: "2024-01-20",
      priority: "low",
      status: "scheduled",
    },
    {
      id: 4,
      type: "maintenance",
      title: "Roof Inspection",
      date: "2024-02-15",
      priority: "medium",
      status: "pending",
    },
  ],
  scheduledMaintenance: [
    {
      id: 1,
      title: "Plumbing Inspection",
      date: "2024-01-18",
      contractor: "ABC Plumbing",
      status: "confirmed",
    },
    {
      id: 2,
      title: "HVAC Annual Service",
      date: "2024-01-20",
      contractor: "Climate Control Inc",
      status: "confirmed",
    },
  ],
  blogPosts: [
    {
      id: 1,
      title: "10 Winter Home Maintenance Tips That Save Money",
      category: "Seasonal",
      readTime: "5 min",
      image:
        "https://images.unsplash.com/photo-1580584126903-c17d41830450?w=600&h=400&fit=crop",
    },
    {
      id: 2,
      title: "Kitchen Remodel Ideas Under $10K",
      category: "Remodeling",
      readTime: "7 min",
      image:
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop",
    },
    {
      id: 3,
      title: "Smart Home Upgrades Worth the Investment",
      category: "Technology",
      readTime: "4 min",
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
    },
    {
      id: 4,
      title: "How to Prepare Your Home for Summer",
      category: "Seasonal",
      readTime: "6 min",
      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop",
    },
  ],
  neighborProjects: [
    {
      id: 1,
      neighborName: "Sarah M.",
      neighborAvatar: "SM",
      project: "Bathroom Renovation",
      contractor: "Elite Home Services",
      rating: 5,
      comment:
        "Amazing work on our master bath! Completed on time and within budget.",
      timeAgo: "2 days ago",
      likes: 12,
      image:
        "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&h=300&fit=crop",
    },
    {
      id: 2,
      neighborName: "John D.",
      neighborAvatar: "JD",
      project: "Solar Panel Installation",
      contractor: "Green Energy Solutions",
      rating: 5,
      comment:
        "Professional team, great communication. Already seeing savings!",
      timeAgo: "5 days ago",
      likes: 8,
      image:
        "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop",
    },
    {
      id: 3,
      neighborName: "Maria L.",
      neighborAvatar: "ML",
      project: "Deck Construction",
      contractor: "Pro Builders LLC",
      rating: 4,
      comment:
        "Beautiful deck! The team was professional throughout the project.",
      timeAgo: "1 week ago",
      likes: 15,
      image:
        "https://images.unsplash.com/photo-1591825729269-caeb344f6df2?w=400&h=300&fit=crop",
    },
  ],
  recommendedContractors: [
    {
      id: 1,
      name: "Elite Home Services",
      category: "General",
      rating: 4.9,
      reviews: 127,
      verified: true,
      neighborPick: true,
    },
    {
      id: 2,
      name: "Green Energy Solutions",
      category: "Solar",
      rating: 4.8,
      reviews: 89,
      verified: true,
      neighborPick: true,
    },
    {
      id: 3,
      name: "Pro Plumbing Co",
      category: "Plumbing",
      rating: 4.7,
      reviews: 203,
      verified: true,
      neighborPick: false,
    },
    {
      id: 4,
      name: "Coastal Roofing",
      category: "Roofing",
      rating: 4.9,
      reviews: 156,
      verified: true,
      neighborPick: false,
    },
  ],
};

function HomeownerHome() {
  const {t} = useTranslation();
  const {currentUser} = useAuth();
  const propertyData = mockPropertyData;
  const [activeTab, setActiveTab] = useState("all");
  const [remindersModalOpen, setRemindersModalOpen] = useState(false);
  const [reminderFilter, setReminderFilter] = useState("all"); // all, overdue, urgent, upcoming

  const homeownerName =
    currentUser?.fullName?.split(" ")[0] ||
    currentUser?.name?.split(" ")[0] ||
    "Homeowner";

  // Defensive: close overlays on user switch (prevents stuck backdrops)
  useEffect(() => {
    setRemindersModalOpen(false);
    setReminderFilter("all");
  }, [currentUser?.id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getDaysUntil = (dateString) => {
    const diffTime = new Date(dateString) - new Date();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "from-emerald-400 to-emerald-600";
    if (score >= 60) return "from-amber-400 to-amber-600";
    return "from-red-400 to-red-600";
  };

  const quickActions = [
    {icon: ClipboardList, label: "Log Maintenance", color: "bg-blue-500"},
    {icon: Camera, label: "Add Photos", color: "bg-purple-500"},
    {icon: FileText, label: "Documents", color: "bg-emerald-500"},
    {icon: Settings, label: "Settings", color: "bg-gray-500"},
  ];

  return (
    <div className="space-y-6 -mx-4 sm:-mx-6 lg:-mx-8 -mt-8">
      {/* ============================================ */}
      {/* HERO SECTION - Full Bleed with Floating Card */}
      {/* ============================================ */}
      <div className="relative">
        {/* Background Image - Full Bleed */}
        <div className="relative h-[420px] lg:h-[480px] overflow-hidden">
          <img
            src={propertyData.mainPhotoUrl || propertyData.mainPhoto}
            alt="Your home"
            className="w-full h-full object-cover"
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col">
          {/* Top Section - Agent Card */}
          <div className="px-4 sm:px-6 lg:px-8 pt-6 flex justify-start">
            <div className="relative overflow-hidden bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-xl p-4 sm:p-5 shadow-xl border border-gray-200/80 dark:border-gray-700/80 w-full lg:w-[480px] min-h-[105px] sm:min-h-[135px] lg:h-auto">
              {/* Subtle gradient accent */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-100/40 to-indigo-100/40 dark:from-blue-900/20 dark:to-indigo-900/20 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-100/30 to-cyan-100/30 dark:from-emerald-900/10 dark:to-cyan-900/10 blur-2xl" />

              <div className="relative flex items-center gap-4 sm:gap-6 h-full">
                {/* Agent Photo with Gradient Background */}
                <div className="relative flex-shrink-0">
                  {/* Gradient Background Circle - Extended horizontally */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-400 via-slate-500 to-slate-600 dark:from-slate-600 dark:via-slate-700 dark:to-slate-800 opacity-40 dark:opacity-50 blur-xl scale-x-[1.4] scale-y-110" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/50 via-indigo-500/40 to-purple-500/50 dark:from-blue-400/40 dark:via-indigo-400/35 dark:to-purple-400/40" />

                  {/* Photo Container */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden ring-4 ring-white/50 dark:ring-gray-800/50 shadow-lg">
                    <img
                      src={
                        propertyData.agent.photo ||
                        "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face"
                      }
                      alt={propertyData.agent.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                {/* Agent Info */}
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 sm:mb-1.5">
                    Your Agent
                  </p>
                  <p className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-0.5">
                    {propertyData.agent.name}
                  </p>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2 sm:mb-2.5">
                    {propertyData.agent.company}
                  </p>
                  {/* Contact Info */}
                  <div className="flex flex-row items-center gap-2 flex-wrap">
                    {propertyData.agent.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                        <a
                          href={`tel:${propertyData.agent.phone}`}
                          className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors whitespace-nowrap"
                        >
                          {propertyData.agent.phone}
                        </a>
                      </div>
                    )}
                    {propertyData.agent.phone && propertyData.agent.email && (
                      <span className="text-gray-400 dark:text-gray-500 text-[10px] sm:text-xs">
                        |
                      </span>
                    )}
                    {propertyData.agent.email && (
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Mail className="w-3 h-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                        <a
                          href={`mailto:${propertyData.agent.email}`}
                          className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors truncate"
                        >
                          {propertyData.agent.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Section - Spacer */}
          <div className="flex-1" />

          {/* Bottom Section - Welcome & Address */}
          <div className="px-4 sm:px-6 lg:px-8 pb-32 lg:pb-36">
            <p className="text-white/70 text-sm mb-1">Welcome back,</p>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
              {homeownerName}
            </h1>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin className="w-4 h-4" />
              <span className="text-base">
                {propertyData.address}, {propertyData.city},{" "}
                {propertyData.state}
              </span>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* FLOATING SCORE CARD - Credit Score Style */}
        {/* ============================================ */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-1/2 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-5 lg:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Score Display */}
                <div className="flex items-center gap-5">
                  {/* Score Circle */}
                  <div className="relative w-20 h-20 lg:w-24 lg:h-24 flex-shrink-0">
                    <svg
                      className="w-full h-full transform -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        stroke="url(#scoreGradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={264}
                        strokeDashoffset={
                          264 - (propertyData.hpsScore / 100) * 264
                        }
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient
                          id="scoreGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                        {propertyData.hpsScore}
                      </span>
                    </div>
                  </div>
                  {/* Score Info */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Home Passport Score
                      </span>
                      <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <TrendingUp className="w-3 h-3" />+
                        {propertyData.scoreChange}
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                      Excellent
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Top 15% in your area
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden lg:block w-px h-16 bg-gray-200 dark:bg-gray-700" />

                {/* Quick Stats */}
                <div className="flex-1 grid grid-cols-3 gap-4">
                  {[
                    {
                      label: "Identity",
                      value: propertyData.healthProgress.identity,
                      icon: Shield,
                    },
                    {
                      label: "Condition",
                      value: propertyData.healthProgress.condition,
                      icon: Target,
                    },
                    {
                      label: "Maintenance",
                      value: propertyData.healthProgress.maintenance,
                      icon: Wrench,
                    },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <stat.icon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {stat.label}
                        </span>
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {stat.value}%
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1.5">
                        <div
                          className={`h-1.5 rounded-full ${stat.value >= 80 ? "bg-emerald-500" : stat.value >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{width: `${stat.value}%`}}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button className="hidden lg:flex items-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                  {t("goToProperty")}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for floating card */}
      <div className="h-20 lg:h-16" />

      {/* ============================================ */}
      {/* QUICK ACTIONS - Horizontal Scroll */}
      {/* ============================================ */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              className="flex items-center gap-2.5 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-gray-300 dark:hover:border-gray-600 transition-colors flex-shrink-0"
            >
              <div
                className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center`}
              >
                <action.icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ============================================ */}
      {/* NEXT UP - Urgent Action Banner */}
      {/* ============================================ */}
      {propertyData.nextAction && (
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/50 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/10 dark:bg-amber-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {propertyData.nextAction.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Due in {propertyData.nextAction.daysUntil} days
                </p>
              </div>
            </div>
            <button className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
              Take Action
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* YOUR PROPERTY - Tasks & Maintenance */}
      {/* ============================================ */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Your Property
          </h2>
          <a
            href="#"
            className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:text-blue-700"
          >
            View all <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Reminders - Clean, neutral with strategic color accents */}
          <div className="relative bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200/60 dark:border-gray-700/50 p-5 shadow-sm hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
                  <Bell className="w-[18px] h-[18px] text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Reminders
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {
                      propertyData.reminders.filter(
                        (r) => r.status === "pending",
                      ).length
                    }{" "}
                    pending
                  </p>
                </div>
              </div>
              <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            {/* Items */}
            <div className="space-y-2">
              {propertyData.reminders.slice(0, 3).map((item) => {
                const daysUntil = getDaysUntil(item.date);
                const isUrgent = daysUntil <= 7 && daysUntil > 0;
                const isOverdue = daysUntil <= 0;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/80 dark:bg-gray-700/30 hover:bg-gray-100/80 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                  >
                    {/* Status dot */}
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        isOverdue
                          ? "bg-red-500"
                          : isUrgent
                            ? "bg-amber-500"
                            : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(item.date)}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-md ${
                        isOverdue
                          ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                          : isUrgent
                            ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                            : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                      }`}
                    >
                      {isOverdue ? "Overdue" : `${daysUntil}d`}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Footer */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setRemindersModalOpen(true);
              }}
              className="mt-4 w-full py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              View all reminders
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scheduled Work - Clean, neutral with strategic color accents */}
          <div className="relative bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200/60 dark:border-gray-700/50 p-5 shadow-sm hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                  <Calendar className="w-[18px] h-[18px] text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Scheduled Work
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {propertyData.scheduledMaintenance.length} upcoming
                  </p>
                </div>
              </div>
              <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            {/* Items */}
            <div className="space-y-2">
              {propertyData.scheduledMaintenance.map((item) => {
                const dateObj = new Date(item.date);
                const month = dateObj.toLocaleDateString("en-US", {
                  month: "short",
                });
                const day = dateObj.getDate();
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/80 dark:bg-gray-700/30 hover:bg-gray-100/80 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                  >
                    {/* Calendar Date Block - subtle styling */}
                    <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 flex flex-col items-center justify-center">
                      <span className="text-[9px] font-semibold uppercase text-gray-500 dark:text-gray-400 leading-none">
                        {month}
                      </span>
                      <span className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                        {day}
                      </span>
                    </div>
                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.contractor}
                      </p>
                    </div>
                    {/* Status */}
                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirmed</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Footer */}
            <button className="mt-4 w-full py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
              View calendar
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* DISCOVER - Blog Posts Horizontal Scroll */}
      {/* ============================================ */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Discover
          </h2>
          <a
            href="#"
            className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:text-blue-700"
          >
            View all <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {["All", "Seasonal", "Remodeling", "Technology", "DIY"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.toLowerCase()
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Cards - Horizontal Scroll */}
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory scrollbar-hide">
          {propertyData.blogPosts.map((post) => (
            <article
              key={post.id}
              className="flex-shrink-0 w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden group cursor-pointer snap-start hover:shadow-lg transition-shadow"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {post.readTime}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ============================================ */}
      {/* COMMUNITY - Neighbor Projects */}
      {/* ============================================ */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Community
            </h2>
          </div>
          <a
            href="#"
            className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:text-blue-700"
          >
            View all <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {/* Neighbor Projects - Horizontal Scroll */}
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory scrollbar-hide">
          {propertyData.neighborProjects.map((project) => (
            <div
              key={project.id}
              className="flex-shrink-0 w-80 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden snap-start"
            >
              {/* Project Image */}
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={project.image}
                  alt={project.project}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                {/* Neighbor Info */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold">
                    {project.neighborAvatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {project.neighborName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {project.timeAgo}
                    </p>
                  </div>
                </div>
                {/* Project Details */}
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  {project.project}
                </h4>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-500">by</span>
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    {project.contractor}
                  </span>
                  <div className="flex items-center gap-0.5 ml-auto">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-medium text-gray-900 dark:text-white">
                      {project.rating}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                  "{project.comment}"
                </p>
                {/* Actions */}
                <div className="flex items-center gap-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{project.likes}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Comment</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================ */}
      {/* CONTRACTORS - Horizontal Scroll */}
      {/* ============================================ */}
      <section className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Hammer className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Trusted Contractors
            </h2>
          </div>
          <a
            href="#"
            className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:text-blue-700"
          >
            View all <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory scrollbar-hide">
          {propertyData.recommendedContractors.map((contractor) => (
            <div
              key={contractor.id}
              className="flex-shrink-0 w-64 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 snap-start hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {contractor.name}
                    </h4>
                    {contractor.verified && (
                      <Shield className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {contractor.category}
                  </p>
                </div>
                {contractor.neighborPick && (
                  <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    Neighbor pick
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mb-4">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {contractor.rating}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({contractor.reviews})
                </span>
              </div>
              <button className="w-full text-sm font-medium text-blue-600 dark:text-blue-400 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                Contact
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================ */}
      {/* REMINDERS MODAL */}
      {/* ============================================ */}
      <ModalBlank
        id="reminders-modal"
        modalOpen={remindersModalOpen}
        setModalOpen={setRemindersModalOpen}
      >
        <div className="flex flex-col h-full max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                All Reminders
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {propertyData.reminders.length} total reminders
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRemindersModalOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                {id: "all", label: "All", count: propertyData.reminders.length},
                {
                  id: "overdue",
                  label: "Overdue",
                  count: propertyData.reminders.filter(
                    (r) =>
                      getDaysUntil(r.date) <= 0 && r.status !== "scheduled",
                  ).length,
                },
                {
                  id: "urgent",
                  label: "Urgent",
                  count: propertyData.reminders.filter((r) => {
                    const days = getDaysUntil(r.date);
                    return days > 0 && days <= 7 && r.status !== "scheduled";
                  }).length,
                },
                {
                  id: "upcoming",
                  label: "Upcoming",
                  count: propertyData.reminders.filter(
                    (r) => getDaysUntil(r.date) > 7,
                  ).length,
                },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setReminderFilter(filter.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    reminderFilter === filter.id
                      ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                      : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  {filter.label}
                  <span
                    className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                      reminderFilter === filter.id
                        ? "bg-white/20 dark:bg-gray-900/20"
                        : "bg-gray-100 dark:bg-gray-600"
                    }`}
                  >
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Reminders List */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-3">
              {propertyData.reminders
                .filter((item) => {
                  const daysUntil = getDaysUntil(item.date);
                  const isOverdue =
                    daysUntil <= 0 && item.status !== "scheduled";
                  const isUrgent =
                    daysUntil > 0 &&
                    daysUntil <= 7 &&
                    item.status !== "scheduled";

                  if (reminderFilter === "all") return true;
                  if (reminderFilter === "overdue") return isOverdue;
                  if (reminderFilter === "urgent") return isUrgent;
                  if (reminderFilter === "upcoming") return daysUntil > 7;
                  return true;
                })
                .map((item) => {
                  const daysUntil = getDaysUntil(item.date);
                  const isOverdue =
                    daysUntil <= 0 && item.status !== "scheduled";
                  const isUrgent =
                    daysUntil > 0 &&
                    daysUntil <= 7 &&
                    item.status !== "scheduled";
                  const Icon = item.type === "maintenance" ? Wrench : FileText;

                  return (
                    <div
                      key={item.id}
                      className={`group flex items-start gap-4 p-4 rounded-xl transition-all hover:shadow-md ${
                        isOverdue
                          ? "bg-red-50/50 dark:bg-red-950/20"
                          : isUrgent
                            ? "bg-amber-50/50 dark:bg-amber-950/20"
                            : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                          isOverdue
                            ? "bg-red-100 dark:bg-red-900/30"
                            : isUrgent
                              ? "bg-amber-100 dark:bg-amber-900/30"
                              : "bg-gray-100 dark:bg-gray-700"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            isOverdue
                              ? "text-red-600 dark:text-red-400"
                              : isUrgent
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-gray-600 dark:text-gray-400"
                          }`}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                              {item.title}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {item.type === "maintenance"
                                ? "Maintenance"
                                : "Document"}{" "}
                              • Due {formatDate(item.date)}
                            </p>
                          </div>
                          {item.priority === "high" && (
                            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`text-xs font-medium px-2.5 py-1 rounded-md ${
                              isOverdue
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : isUrgent
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                  : item.status === "scheduled"
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                            }`}
                          >
                            {item.status === "scheduled"
                              ? "Scheduled"
                              : isOverdue
                                ? "Overdue"
                                : isUrgent
                                  ? `Due in ${daysUntil} days`
                                  : `${daysUntil} days left`}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 flex items-center gap-1">
                        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100">
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            {propertyData.reminders.filter((item) => {
              const daysUntil = getDaysUntil(item.date);
              const isOverdue = daysUntil <= 0 && item.status !== "scheduled";
              const isUrgent =
                daysUntil > 0 && daysUntil <= 7 && item.status !== "scheduled";

              if (reminderFilter === "all") return true;
              if (reminderFilter === "overdue") return isOverdue;
              if (reminderFilter === "urgent") return isUrgent;
              if (reminderFilter === "upcoming") return daysUntil > 7;
              return true;
            }).length === 0 && (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  No reminders found
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Try selecting a different filter
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <button className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Mark all as read
              </button>
              <button className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                Create Reminder
              </button>
            </div>
          </div>
        </div>
      </ModalBlank>
    </div>
  );
}

export default HomeownerHome;
