export default function ImprintPage() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <header>
          <h1 className="text-3xl font-bold mb-2">Imprint / Impressum</h1>
          <p className="text-sm text-gray-600">Updated {new Date().getFullYear()}</p>
        </header>

        <section className="bg-white shadow-sm rounded-lg p-6 space-y-3">
          <h2 className="text-lg font-semibold">Information according to § 5 TMG</h2>
          <p>Timo Elony</p>
          <p>Sauerbruchstr. 8</p>
          <p>42549 Velbert</p>
          <p>Germany</p>
        </section>

        <section className="bg-white shadow-sm rounded-lg p-6 space-y-3">
          <h2 className="text-lg font-semibold">Contact</h2>
          <p>Tel: +49 157 70260734</p>
          <p>
            Email: <a href="mailto:timo.elony@gmail.com" className="text-blue-600 hover:text-blue-500">timo.elony@gmail.com</a>
          </p>
        </section>

        <section className="bg-white shadow-sm rounded-lg p-6 space-y-3">
          <h2 className="text-lg font-semibold">Purpose of this website</h2>
          <p className="text-sm text-gray-700">
            This website is a purely informational, non-commercial resource providing access to a database of climbing routes in Egypt.
            No commercial services, tour bookings, guided trips, or paid services are offered through this platform.
          </p>
        </section>

        <section className="bg-white shadow-sm rounded-lg p-6 space-y-3">
          <h2 className="text-lg font-semibold">User-Generated Content & Liability</h2>
          <p className="text-sm text-gray-700">
            This website allows registered users to contribute and upload content. The operator takes no responsibility for the accuracy,
            completeness, or legality of content uploaded by third parties. Users are solely responsible for the content they submit.
          </p>
          <p className="text-sm text-gray-700">
            All information about climbing routes, grades, conditions, and access is provided without guarantee of accuracy or completeness.
            Route information may be outdated, incorrect, or change without notice. Users must verify all information independently before use.
          </p>
        </section>

        <section className="bg-white shadow-sm rounded-lg p-6 space-y-3">
          <h2 className="text-lg font-semibold">Safety Warning</h2>
          <p className="text-sm text-gray-700">
            Rock climbing and mountaineering are inherently dangerous activities that can result in serious injury or death. Users of this
            website engage in climbing activities entirely at their own risk. The operator assumes no liability for accidents, injuries, or
            damages that may occur from the use of information provided on this website. Always climb with proper equipment, training, and
            safety precautions.
          </p>
        </section>

        <section className="bg-white shadow-sm rounded-lg p-6 space-y-3">
          <h2 className="text-lg font-semibold">Liability for Content</h2>
          <p className="text-sm text-gray-700">
            As a service provider, we are responsible for our own content on these pages in accordance with general law. However, we are not
            obligated to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity.
            If you become aware of any content that violates rights or is inappropriate, please contact us immediately.
          </p>
        </section>

        <section className="bg-white shadow-sm rounded-lg p-6 space-y-3">
          <h2 className="text-lg font-semibold">Liability for Links</h2>
          <p className="text-sm text-gray-700">
            Our website may contain links to external third-party websites. We have no influence on the content of these linked pages and
            therefore cannot accept any liability for them. The respective provider or operator of the pages is always responsible for the
            content of the linked pages.
          </p>
        </section>

        <section className="bg-white shadow-sm rounded-lg p-6 space-y-3">
          <h2 className="text-lg font-semibold">Data Protection / Privacy</h2>
          <p className="text-sm text-gray-700">
            This website processes personal data (user accounts, uploaded content, login information). We take the protection of your personal
            data seriously and treat it confidentially in accordance with legal data protection regulations and this privacy notice.
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Data Collected:</span> When you create an account, we collect and store your email address, username, and any content you upload
            (routes, topos, descriptions). We also log access data for security purposes.
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Purpose:</span> Your data is used solely to provide the functionality of this website (user accounts, content management) and to
            maintain security. We do not sell, share, or use your data for marketing purposes.
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Data Storage:</span> Your data is stored securely on servers located in the European Union (hosting provider data center). We implement
            appropriate technical and organizational measures to protect your data.
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Your Rights:</span> You have the right to access, correct, delete, or restrict processing of your personal data. To exercise these rights,
            please contact us at the email above.
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Cookies:</span> This website uses essential cookies for login functionality. No tracking or analytics cookies are used.
          </p>
        </section>

        <section className="bg-white shadow-sm rounded-lg p-6 space-y-3">
          <h2 className="text-lg font-semibold">Dispute Resolution</h2>
          <p className="text-sm text-gray-700">
            The European Commission provides a platform for online dispute resolution (ODR):{' '}
            <a
              href="https://ec.europa.eu/consumers/odr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-500"
            >
              https://ec.europa.eu/consumers/odr/
            </a>.
            We are not obligated to participate in dispute resolution procedures before a consumer arbitration board, as this is a
            non-commercial informational website.
          </p>
        </section>

        <section className="bg-white shadow-sm rounded-lg p-6 space-y-3">
          <h2 className="text-lg font-semibold">Copyright</h2>
          <p className="text-sm text-gray-700">
            © {new Date().getFullYear()} Timo Elony. All rights reserved. All content on this website, including but not limited to text,
            images, logos, graphics, and data, is the property of Timo Elony or respective content contributors and is protected by
            international copyright laws. Unauthorized reproduction or distribution is prohibited.
          </p>
        </section>
      </div>
    </div>
  );
}
