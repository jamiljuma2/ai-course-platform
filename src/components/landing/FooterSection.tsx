export default function FooterSection() {
  return (
    <footer className="bg-dark-900 border-t border-dark-700 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-sm font-bold">AI</div>
              <span className="font-bold text-white">AI for Beginners</span>
            </div>
            <p className="text-dark-400 text-sm leading-relaxed">
              The practical AI course built for Kenyan students, freelancers, and professionals.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Course</h4>
            <ul className="space-y-2 text-dark-400 text-sm">
              <li><a href="#modules" className="hover:text-white transition-colors">All Modules</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#enroll" className="hover:text-white transition-colors">Enroll Now</a></li>
              <li><a href="/dashboard" className="hover:text-white transition-colors">Student Dashboard</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-dark-400 text-sm">
              <li><a href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@aicourse.co.ke'}`} className="hover:text-white transition-colors">Email Support</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-dark-700 pt-8 text-center text-dark-500 text-sm">
          <p>© {new Date().getFullYear()} AI for Beginners. All rights reserved. | Made in Kenya 🇰🇪</p>
        </div>
      </div>
    </footer>
  )
}
