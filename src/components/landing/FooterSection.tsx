export default function FooterSection() {
  return (
    <footer className="bg-white border-t border-brand-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-sm font-bold text-white shadow-md shadow-brand-500/25">NG</div>
              <span className="font-bold text-dark-900">NextGen Academy</span>
            </div>
            <p className="text-dark-600 text-sm leading-relaxed">
              Practical courses for Kenyan students, freelancers, and professionals who want job-ready skills.
            </p>
          </div>
          <div>
            <h4 className="text-dark-900 font-semibold mb-4">Courses</h4>
            <ul className="space-y-2 text-dark-600 text-sm">
              <li><a href="#courses" className="hover:text-brand-700 transition-colors">All Courses</a></li>
              <li><a href="#modules" className="hover:text-brand-700 transition-colors">All Modules</a></li>
              <li><a href="#enroll" className="hover:text-brand-700 transition-colors">Enroll Now</a></li>
              <li><a href="/dashboard" className="hover:text-brand-700 transition-colors">Student Dashboard</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-dark-900 font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-dark-600 text-sm">
              <li><a href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@nextgenacademy.com'}`} className="hover:text-brand-700 transition-colors">Email Support</a></li>
              <li><a href="/faq" className="hover:text-brand-700 transition-colors">FAQ</a></li>
              <li><a href="/privacy" className="hover:text-brand-700 transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-brand-700 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-brand-100 pt-8 text-center text-dark-500 text-sm">
          <p>© {new Date().getFullYear()} NextGen Academy. All rights reserved. | Made in Kenya 🇰🇪</p>
        </div>
      </div>
    </footer>
  )
}
