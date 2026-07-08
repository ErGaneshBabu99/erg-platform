"use client";

import React, { useState } from "react";
import { MessageCircle, Phone, Mail, Send, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactInput } from "@/lib/validations/contact";
import { Input } from "@/components/ui/input";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

const WHATSAPP = "+9779847805353";
const WHATSAPP_LINK = "https://wa.me/9779847805353";
const PHONE = "+9779847805353";
const EMAIL = "chapagainganeshutube98@gmail.com";

export function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactInput) => {
    const { honeypot, ...payload } = data;
    if (honeypot) return;
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) { setSubmitted(true); reset(); }
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <section id="contact" className="py-20 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 relative overflow-hidden">
      {/* Subtle ambient accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/[0.04] rounded-full blur-3xl pointer-events-none" />

      <div className="container-erg relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">

          {/* Left */}
          <Reveal>
            <p className="text-xs font-semibold text-navy-600 dark:text-blue-400 uppercase tracking-widest mb-3">Contact</p>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 dark:text-white mb-4">
              Get in Touch
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8 max-w-sm">
              Need a district rate in Word or Excel format? Want to post a vacancy?
              Have a question? We respond within 24 hours.
            </p>

            <div className="space-y-3">
              <a
                href={WHATSAPP_LINK + "?text=Hello%20Er%20G%2C%20I%20need%20help%20with..."}
                target="_blank"
                rel="noopener noreferrer"
                className="hover-lift flex items-center gap-3.5 p-4 border border-gray-100 dark:border-gray-800 rounded-xl hover:border-green-200 dark:hover:border-green-800 hover:bg-green-50/50 dark:hover:bg-green-900/10 hover:shadow-card transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">WhatsApp</div>
                  <div className="text-xs text-gray-400">{WHATSAPP} · Fastest response</div>
                </div>
              </a>

              <a
                href={"tel:" + PHONE}
                className="hover-lift flex items-center gap-3.5 p-4 border border-gray-100 dark:border-gray-800 rounded-xl hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 hover:shadow-card transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">Call Us</div>
                  <div className="text-xs text-gray-400">{PHONE}</div>
                </div>
              </a>

              <a
                href={"mailto:" + EMAIL}
                className="hover-lift flex items-center gap-3.5 p-4 border border-gray-100 dark:border-gray-800 rounded-xl hover:border-navy-200 dark:hover:border-navy-700 hover:bg-navy-50/50 dark:hover:bg-navy-900/10 hover:shadow-card transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-navy-600 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-navy-700 dark:group-hover:text-navy-300 transition-colors">Email</div>
                  <div className="text-xs text-gray-400">{EMAIL}</div>
                </div>
              </a>
            </div>
          </Reveal>

          {/* Right — Form */}
          <Reveal delay={2} className="glass-light rounded-3xl p-7 shadow-[0_20px_60px_-20px_rgba(26,58,107,0.25)] border border-white/40 dark:border-white/10">
            {submitted ? (
              <div className="text-center py-10 animate-pop-in">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">Message Sent!</h3>
                <p className="text-sm text-gray-500 mb-5">We will get back to you within 24 hours.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-sm font-semibold text-navy-600 hover:text-navy-700 dark:text-blue-400 transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="focus-glow rounded-2xl">
                <h3 className="font-bold text-gray-900 dark:text-white mb-5 text-base">Send a Message</h3>
                <input type="text" {...register("honeypot")} className="hidden" tabIndex={-1} aria-hidden="true" autoComplete="off" />

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Name" {...register("name")} error={errors.name?.message} placeholder="Ram Sharma" required />
                    <Input label="Email" type="email" {...register("email")} error={errors.email?.message} placeholder="ram@example.com" required />
                  </div>
                  <Input label="Phone (optional)" type="tel" {...register("phone")} placeholder="+977 98XXXXXXXX" />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Request Type</label>
                    <select {...register("type")} className="input-base">
                      <option value="GENERAL">General Inquiry</option>
                      <option value="WORD_FORMAT">District Rate in Word</option>
                      <option value="EXCEL_FORMAT">District Rate in Excel</option>
                      <option value="EDITABLE_FORMAT">Editable Format</option>
                      <option value="CUSTOM_REQUEST">Custom Request</option>
                    </select>
                  </div>

                  <Input label="Subject" {...register("subject")} error={errors.subject?.message} placeholder="e.g. Kathmandu district rate in Excel" required />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Message <span className="text-red-500">*</span></label>
                    <textarea
                      {...register("message")}
                      rows={3}
                      className={cn("input-base resize-none", errors.message && "border-red-300 focus:ring-red-500")}
                      placeholder="Describe your requirement..."
                    />
                    {errors.message && <p className="mt-1.5 text-sm text-red-600" role="alert">{errors.message.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="shine w-full flex items-center justify-center gap-2 py-3 bg-navy-600 hover:bg-navy-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:shadow-[0_4px_20px_rgba(26,58,107,0.35)] hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : <Send className="w-4 h-4" />}
                    Send Message
                  </button>
                </div>
              </form>
            )}
          </Reveal>

        </div>
      </div>
    </section>
  );
}
