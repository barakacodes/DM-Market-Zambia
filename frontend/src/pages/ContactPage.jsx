export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <p><strong>Email:</strong> support@dmmarket.co.zm</p>
        <p><strong>Phone:</strong> +260 97 1234567</p>
        <p><strong>Address:</strong> Lusaka, Zambia</p>
        <form className="mt-6 space-y-4">
          <input type="text" placeholder="Your name" className="w-full border px-3 py-2 rounded" />
          <input type="email" placeholder="Your email" className="w-full border px-3 py-2 rounded" />
          <textarea rows="4" placeholder="Your message" className="w-full border px-3 py-2 rounded"></textarea>
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700">Send Message</button>
        </form>
      </div>
    </div>
  );
}
