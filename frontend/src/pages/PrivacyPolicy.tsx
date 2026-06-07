import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicy() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-800/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className="prose prose-invert max-w-none space-y-8 text-white/80">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Privacy Policy</h2>
            <p className="mb-4">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">1. Introduction</h3>
            <p>
              JobOps ("we", "our", or "us") operates the JobOps website and mobile application. This page informs you of 
              our policies regarding the collection, use, and disclosure of personal data when you use our Service and the 
              choices you have associated with that data.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">2. Types of Data Collected</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-white mb-2">Personal Data</h4>
                <p>
                  While using our Service, we may ask you to provide us with certain personally identifiable information 
                  that can be used to contact or identify you ("Personal Data"). This may include, but is not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                  <li>Email address</li>
                  <li>First name and last name</li>
                  <li>Phone number</li>
                  <li>Address, State, Province, ZIP/Postal code, City</li>
                  <li>Cookies and Usage Data</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Usage Data</h4>
                <p>
                  We may also collect information about how the Service is accessed and used ("Usage Data"). This may 
                  include information such as your computer's Internet Protocol address (e.g. IP address), browser type, 
                  browser version, the pages you visit, the time and date of your visit, the time spent on those pages, 
                  and other diagnostic data.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">3. Use of Data</h3>
            <p>JobOps uses the collected data for various purposes:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
              <li>To provide and maintain our Service</li>
              <li>To notify you about changes to our Service</li>
              <li>To allow you to participate in interactive features of our Service</li>
              <li>To gather analysis or valuable information so that we can improve our Service</li>
              <li>To monitor the usage of our Service</li>
              <li>To detect, prevent and address technical issues</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">4. Deleted Account Data Retention</h3>
            <div className="bg-white/5 p-6 rounded-lg border border-white/10 space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Data Retention During Recovery Period</h4>
                <ul className="space-y-2 ml-4 list-disc list-inside">
                  <li>When you request account deletion, your data is retained for a 7-day recovery period only</li>
                  <li>This data cannot be accessed by you or anyone else during the recovery period</li>
                  <li>Data retention during this period is solely for the purpose of account recovery</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Approved Recovery Requests</h4>
                <ul className="space-y-2 ml-4 list-disc list-inside">
                  <li>If your recovery request is approved by our admin team, all your data is immediately restored</li>
                  <li>You regain full access to your account, resumes, job history, and all associated data</li>
                  <li>Your account functions as if deletion never occurred</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Permanent Deletion After 7 Days</h4>
                <ul className="space-y-2 ml-4 list-disc list-inside">
                  <li>If no recovery approval is obtained within 7 days, all account data is permanently deleted</li>
                  <li>This deletion is irreversible and includes all personal information, resumes, job applications, and related data</li>
                  <li>Deleted data cannot be recovered after the 7-day period expires</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Account Recreation After Deletion</h4>
                <ul className="space-y-2 ml-4 list-disc list-inside">
                  <li>After the 7-day recovery period expires and permanent deletion occurs, you may create a new account</li>
                  <li>Creating a new account will start with a fresh user profile with no history of previous account data</li>
                  <li>You can use the same email address to register for a new account</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">5. Security of Data</h3>
            <p>
              The security of your data is important to us but remember that no method of transmission over the Internet 
              or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect 
              your Personal Data, we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">6. Links to Other Sites</h3>
            <p>
              Our Service may contain links to other sites that are not operated by us. If you click on a third party link, 
              you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every 
              site you visit. We have no control over and assume no responsibility for the content, privacy policies or 
              practices of any third party sites or services.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">7. Changes to This Privacy Policy</h3>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
              Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">8. Contact Us</h3>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10 mt-3">
              <p className="font-semibold text-white">Email: support@jobops.com</p>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  )
}
