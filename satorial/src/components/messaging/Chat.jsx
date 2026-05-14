import { useEffect, useMemo, useState } from "react";
import {
  ExternalLink,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MessageSquare,
  Phone,
  Search,
  Send,
  Twitter,
  User,
} from "lucide-react";
import ClientService from "../../services/ClientService";
import SettingsService from "../../services/settings";

const normalizeHandle = (value = "") => value.trim().replace(/^@/, "");
const digitsOnly = (value = "") => value.replace(/\D/g, "");

const buildSocialLinks = (profile = {}) => {
  const instagram = normalizeHandle(profile.instagram_handle);
  const twitter = normalizeHandle(profile.twitter_handle);
  const facebook = normalizeHandle(profile.facebook_handle);
  const linkedin = normalizeHandle(profile.linkedin_handle);

  return [
    instagram && {
      key: "instagram",
      label: "Instagram",
      icon: Instagram,
      href: `https://instagram.com/${instagram}`,
      color: "text-pink-600 bg-pink-50 border-pink-100",
    },
    twitter && {
      key: "twitter",
      label: "X / Twitter",
      icon: Twitter,
      href: `https://x.com/${twitter}`,
      color: "text-sky-600 bg-sky-50 border-sky-100",
    },
    facebook && {
      key: "facebook",
      label: "Facebook",
      icon: Facebook,
      href: /^https?:\/\//i.test(facebook)
        ? facebook
        : `https://facebook.com/${facebook}`,
      color: "text-blue-700 bg-blue-50 border-blue-100",
    },
    linkedin && {
      key: "linkedin",
      label: "LinkedIn",
      icon: Linkedin,
      href: /^https?:\/\//i.test(linkedin)
        ? linkedin
        : `https://linkedin.com/company/${linkedin}`,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    profile.website_url && {
      key: "website",
      label: "Website",
      icon: Globe,
      href: profile.website_url,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
  ].filter(Boolean);
};

const ChatComponent = () => {
  const [clients, setClients] = useState([]);
  const [profile, setProfile] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [clientData, profileData] = await Promise.all([
          ClientService.getClients(),
          SettingsService.Profile.getProfile(),
        ]);
        const clientList = Array.isArray(clientData) ? clientData : [];
        setClients(clientList);
        setProfile(profileData || {});
        setSelectedClientId(clientList[0]?.id || null);
      } catch (err) {
        console.error("Failed to load messaging data:", err);
        setError("Unable to load clients and social channels.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredClients = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return clients;

    return clients.filter((client) => {
      const fullName = `${client.first_name || ""} ${client.last_name || ""}`.trim();
      return [fullName, client.email, client.phone_number]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [clients, searchTerm]);

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === selectedClientId) || filteredClients[0],
    [clients, filteredClients, selectedClientId]
  );

  const socialLinks = useMemo(() => buildSocialLinks(profile), [profile]);

  const clientName = selectedClient
    ? `${selectedClient.first_name || ""} ${selectedClient.last_name || ""}`.trim() || "Client"
    : "Client";
  const encodedMessage = encodeURIComponent(
    message.trim() || `Hello ${clientName}, reaching out from ${profile?.business_name || "Sartorial Smart"}.`
  );
  const phoneDigits = digitsOnly(selectedClient?.phone_number || "");

  const contactActions = [
    selectedClient?.email && {
      label: "Email",
      icon: Mail,
      href: `mailto:${selectedClient.email}?subject=${encodeURIComponent(
        `${profile?.business_name || "Sartorial Smart"} message`
      )}&body=${encodedMessage}`,
      primary: true,
    },
    phoneDigits && {
      label: "WhatsApp",
      icon: MessageSquare,
      href: `https://wa.me/${phoneDigits}?text=${encodedMessage}`,
      primary: true,
    },
    phoneDigits && {
      label: "SMS",
      icon: Phone,
      href: `sms:${phoneDigits}?body=${encodedMessage}`,
      primary: false,
    },
  ].filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin mx-auto" />
          <p className="mt-4 text-sm text-gray-600">Loading messaging hub...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center">
        <div className="bg-white border border-red-100 rounded-lg p-6 text-center max-w-md">
          <p className="font-semibold text-gray-900">Messaging unavailable</p>
          <p className="text-sm text-gray-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-gray-50">
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] bg-white border border-gray-200 rounded-lg overflow-hidden">
        <aside className="border-r border-gray-200 bg-white">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search clients"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="max-h-[620px] overflow-y-auto">
            {filteredClients.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">No clients found</div>
            ) : (
              filteredClients.map((client) => {
                const name = `${client.first_name || ""} ${client.last_name || ""}`.trim() || "Unnamed Client";
                const isActive = client.id === selectedClient?.id;
                return (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => setSelectedClientId(client.id)}
                    className={`w-full text-left p-4 flex items-center gap-3 border-b border-gray-50 transition-colors ${
                      isActive ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {client.email || client.phone_number || "No contact detail"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <main className="bg-gray-50">
          {selectedClient ? (
            <div className="p-6 space-y-6">
              <section className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <User size={24} />
                    </div>
                    <div>
                      <h1 className="text-xl font-semibold text-gray-900">{clientName}</h1>
                      <p className="text-sm text-gray-500">
                        {[selectedClient.email, selectedClient.phone_number].filter(Boolean).join(" • ") || "No contact detail"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {contactActions.map((action) => (
                      <a
                        key={action.label}
                        href={action.href}
                        target={action.href.startsWith("http") ? "_blank" : undefined}
                        rel={action.href.startsWith("http") ? "noreferrer" : undefined}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                          action.primary
                            ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <action.icon size={16} />
                        {action.label}
                      </a>
                    ))}
                  </div>
                </div>
              </section>

              <section className="bg-white border border-gray-200 rounded-lg p-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message draft
                </label>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={5}
                  placeholder={`Hello ${clientName},`}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-gray-500">The draft is attached to Email, WhatsApp, or SMS actions.</p>
                  <Send className="text-gray-400" size={18} />
                </div>
              </section>

              <section className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900">Business channels</h2>
                  <span className="text-xs text-gray-500">{socialLinks.length} connected</span>
                </div>

                {socialLinks.length === 0 ? (
                  <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-4">
                    Add social handles in Settings to show them here.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {socialLinks.map((link) => (
                      <a
                        key={link.key}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg border ${link.color} hover:opacity-80 transition-opacity`}
                      >
                        <span className="flex items-center gap-2 font-medium">
                          <link.icon size={17} />
                          {link.label}
                        </span>
                        <ExternalLink size={15} />
                      </a>
                    ))}
                  </div>
                )}
              </section>
            </div>
          ) : (
            <div className="p-10 text-center text-gray-500">Select a client to start.</div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ChatComponent;
