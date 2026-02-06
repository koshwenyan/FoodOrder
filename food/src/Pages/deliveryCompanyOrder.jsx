import React from "react";

const deliveryCompanyOrder = () => {
  return (
    <div className="min-h-screen bg-[#f6f1eb] text-[#1f1a17]">
      <div className="px-6 py-6 sm:px-10">
        <div className="rounded-3xl bg-gradient-to-br from-[#f9e9d7] via-[#f8f3ee] to-[#f2ddc7] p-6 sm:p-8 shadow-lg border border-[#ead8c7]">
          <p className="text-sm uppercase tracking-[0.2em] text-[#8b6b4f]">
            Delivery Company
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold">
            Company Orders
          </h1>
          <p className="text-sm text-[#6c5645] mt-2">
            Track assigned orders and delivery progress.
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-dashed border-[#d6c3b2] bg-white/70 p-10 text-center text-[#6c5645]">
          No orders to show yet.
        </div>
      </div>
    </div>
  );
};

export default deliveryCompanyOrder;
