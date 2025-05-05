'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

const roleBasedQuestions = {
  owner: [
    {
      question: "How do I manage employee permissions?",
      answer: "Navigate to the Settings > User Management section to adjust role-based access controls."
    },
    {
      question: "How can I generate financial reports?",
      answer: "Use the Reporting section to generate real-time financial reports and export them in multiple formats."
    }
  ],
  employee: [
    {
      question: "How do I submit my timesheet?",
      answer: "Go to the Time Tracking section and submit your weekly hours before Friday 5 PM."
    },
    {
      question: "Where can I find my schedule?",
      answer: "Your work schedule is available in the Calendar section and is updated every Sunday."
    }
  ],
  client: [
    {
      question: "How do I track my order status?",
      answer: "Check the Order Tracking portal for real-time updates on your shipments."
    },
    {
      question: "What's our contract renewal process?",
      answer: "Contact your account manager or visit the Contracts section 30 days before expiration."
    }
  ],
  supplier: [
    {
      question: "How do I update my product catalog?",
      answer: "Use the Supplier Portal to upload new inventory files every Monday before noon."
    },
    {
      question: "Where do I submit invoices?",
      answer: "Submit all invoices through the Vendor Payment System with PO numbers included."
    }
  ]
};

export default function QandA() {
  const { data: session } = useSession();
  const [openQuestion, setOpenQuestion] = useState(null);

  const getQuestions = () => {
    if (!session?.user?.role) return [];
    const role = session.user.role.toLowerCase();
    return roleBasedQuestions[role] || [];
  };

  const toggleAnswer = (index) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  if (!session?.user?.role) {
    return (
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg text-gray-600">Please log in to view your personalized Q&A</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Role-specific Questions & Answers</h1>
        
        <div className="space-y-4">
          {getQuestions().map((item, index) => (
            <div 
              key={index}
              className="border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => toggleAnswer(index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center"
              >
                <span className="font-medium text-gray-700">{item.question}</span>
                <svg
                  className={`w-5 h-5 transform transition-transform ${
                    openQuestion === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              
              {openQuestion === index && (
                <div className="px-6 py-4 border-t bg-gray-50">
                  <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {getQuestions().length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">
              No questions available for your role ({session.user.role}). 
              Please contact support for assistance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}