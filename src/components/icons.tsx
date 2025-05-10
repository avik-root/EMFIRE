
import {
  Wallet,
  Users,
  PlusCircle,
  Send,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Settings,
  LogIn,
  LogOut,
  ChevronDown,
  Copy,
  ExternalLink,
  Menu,
  Sun,
  Moon,
  Home,
  FileText,
  Briefcase,
  AlertTriangle,
  Info,
  Eye,
  EyeOff,
  RefreshCw,
  Archive,
  ArrowRight,
  Link as LinkIcon,
  CreditCard,
  Activity,
  BarChart,
  UserMinus, 
  User, 
  ArrowLeft, 
  ChevronRight, 
} from 'lucide-react';

// Define the logo component
function AppLogoComponent(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      <path d="M12 22V12" />
      <path d="M17 8.9l-5 2.5-5-2.5" />
      <path d="M7 15.1l5-2.5 5 2.5" />
    </svg>
  );
}

export const Icons = {
  Wallet,
  Users,
  User, 
  PlusCircle,
  Send,
  Confirm: CheckCircle2,
  Reject: XCircle,
  Risk: ShieldAlert,
  Settings,
  Login: LogIn,
  Logout: LogOut,
  ChevronDown,
  ChevronRight, 
  Copy,
  ExternalLink,
  Menu,
  Sun,
  Moon,
  Home,
  Proposal: FileText,
  Briefcase,
  Warning: AlertTriangle,
  Info,
  View: Eye,
  Hide: EyeOff,
  Refresh: RefreshCw,
  Archive,
  ArrowRight,
  ArrowLeft, 
  Link: LinkIcon,
  Card: CreditCard,
  Activity,
  Analytics: BarChart,
  UserMinus, 
  AppLogo: AppLogoComponent,
};

