import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

export default function TermsOfService() {
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
          <h1 className="text-2xl font-bold text-white">Terms of Service</h1>
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
            <h2 className="text-2xl font-bold text-white mb-4">Terms of Service</h2>
            <p className="mb-4">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h3>
            <p>
              By accessing and using JobOps, you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">2. Use License</h3>
            <p className="mb-3">
              Permission is granted to temporarily download one copy of the materials (information or software) on JobOps 
              for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, 
              and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Modify or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software contained on JobOps</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
              <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">3. Disclaimer</h3>
            <p>
              The materials on JobOps are provided on an 'as is' basis. JobOps makes no warranties, expressed or implied, 
              and hereby disclaims and negates all other warranties including, without limitation, implied warranties or 
              conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property 
              or other violation of rights.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">4. Limitations</h3>
            <p>
              In no event shall JobOps or its suppliers be liable for any damages (including, without limitation, damages 
              for loss of data or profit, or due to business interruption) arising out of the use or inability to use the 
              materials on JobOps, even if JobOps or an authorized representative has been notified orally or in writing of 
              the possibility of such damage.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">5. Account Deletion and Recovery Policy</h3>
            <div className="bg-white/5 p-6 rounded-lg border border-white/10 space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Free Plan Account Recovery</h4>
                <ul className="space-y-2 ml-4 list-disc list-inside">
                  <li>When you request account deletion, your account enters a 7-day recovery period</li>
                  <li>During this period, you cannot log in and your email address is restricted from registration</li>
                  <li>You can submit a recovery request to restore your account during this period</li>
                  <li>Recovery requests are reviewed and approved by our admin team</li>
                  <li>If your recovery request is approved, your account data is restored and you can log in normally</li>
                  <li>If your recovery request is rejected, the 7-day recovery period continues</li>
                  <li>After 7 days without approval, all account data is permanently deleted</li>
                  <li>Following permanent deletion, you can create a new account with the same email address</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Monthly/Yearly Plan Account Recovery</h4>
                <ul className="space-y-2 ml-4 list-disc list-inside">
                  <li>Deletion requests for paid plans include all subscription benefits and usage in the 7-day recovery consideration</li>
                  <li>Your subscription is suspended during the recovery period and will not be charged</li>
                  <li>If your account is restored, your subscription resumes with remaining benefits</li>
                  <li>All other recovery policies follow the same 7-day recovery period structure</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">6. Accuracy of Materials</h3>
            <p>
              The materials appearing on JobOps could include technical, typographical, or photographic errors. JobOps does 
              not warrant that any of the materials on its website are accurate, complete, or current. JobOps may make 
              changes to the materials contained on its website at any time without notice.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">7. Links</h3>
            <p>
              JobOps has not reviewed all of the sites linked to its website and is not responsible for the contents of any 
              such linked site. The inclusion of any link does not imply endorsement by JobOps of the site. Use of any such 
              linked website is at the user's own risk.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">8. Modifications</h3>
            <p>
              JobOps may revise these terms of service for its website at any time without notice. By using this website, 
              you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">9. Governing Law</h3>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in 
              which JobOps operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">10. Contact Information</h3>
            <p>
              If you have any questions about these Terms of Service, please contact us at support@jobops.com
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  )
}
