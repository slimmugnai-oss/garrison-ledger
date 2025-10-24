"use client";

import PaymentButton from "./PaymentButton";
import Badge from "./ui/Badge";

interface QuestionPackCardProps {
  questions: number;
  price: number;
  priceId: string;
  perQuestionCost: number;
  mostPopular?: boolean;
}

export default function QuestionPackCard({
  questions,
  price,
  priceId,
  perQuestionCost,
  mostPopular,
}: QuestionPackCardProps) {
  return (
    <div
      className={`relative rounded-lg border-2 p-6 ${mostPopular ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"}`}
    >
      {mostPopular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 px-3 py-1 text-white">
          Best Value
        </Badge>
      )}
      <div className="mb-4 text-center">
        <div className="text-4xl font-bold text-gray-900">{questions}</div>
        <div className="text-sm text-gray-600">questions</div>
      </div>
      <div className="mb-4 text-center">
        <div className="text-3xl font-bold text-gray-900">${price.toFixed(2)}</div>
        <div className="text-sm text-gray-500">
          {(perQuestionCost * 100).toFixed(1)}¢ per question
        </div>
      </div>
      <PaymentButton
        priceId={priceId}
        buttonText="Buy Now"
        className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
      />
    </div>
  );
}
