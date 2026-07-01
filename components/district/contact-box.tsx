import React from "react";
import Link from "next/link";
import { MessageCircle, Phone, Mail, FileSpreadsheet, FileText } from "lucide-react";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+977980XXXXXXX";
const PHONE = process.env.NEXT_PUBLIC_PHONE_NUMBER ?? "+977980XXXXXXX";
const EMAIL = process.env.NEXT_PUBLIC_EMAIL ?? "info@erg.com.np";

interface ContactBoxProps {
  districtName: string;
  districtRateId: string;
}

export function ContactBox({ districtName, districtRateId }: ContactBoxProps) {
  const waMessage = encodeURIComponent(
    `Hello Er G, I need the district rate of ${districtName} in a different format.`
  );

  return (
    <div className="card-base p-5 border-l-4 border-l-navy-600">
      <h3 className="font-bold text-gray-900 dark:text-white mb-1">
        Need a Different Format?
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Get this district rate in Word, Excel, or editable format.
      </p>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2 mb-3">
          {["Word", "Excel", "Editable"].map((fmt) => (
            <span
              key={fmt}
              className="flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-full font-medium"
            >
              {fmt === "Excel" ? <FileSpreadsheet className="w-3.5 h-3.5 text-green-500" /> : <FileText className="w-3.5 h-3.5 text-blue-500" />}
              {fmt} Format
            </span>
          ))}
        </div>

        <a
          href={`https://wa.me/${WHATSAPP.replace(/\D/g, "")}?text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp Us
        </a>

        <div className="grid grid-cols-2 gap-2">
          <a
            href={`tel:${PHONE}`}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-xl transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            Call
          </a>
          <Link
            href={`/contact?type=WORD_FORMAT&ref=${districtRateId}`}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-xl transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            Email
          </Link>
        </div>
      </div>
    </div>
  );
}
