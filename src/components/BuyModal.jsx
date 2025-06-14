import React, { useState, useEffect } from "react";

export default function BuyModal({ open, onClose, stockData, onConfirm }) {
  const [quantity, setQuantity] = useState(1);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    if (open) {
      fetch("http://localhost:8000/api/mock-investment/balance", {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          setBalance(data.balance);
        })
        .catch((err) => {
          console.error("잔고 불러오기 실패:", err);
        });
    }
  }, [open]);

  const handleSubmit = async () => {
    if (quantity < 1 || isNaN(quantity)) return;

    try {
      const res = await fetch("http://localhost:8000/api/mock-investment/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          symbol: stockData.symbol,
          price: stockData.currentPrice,
          quantity: Number(quantity),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert("매수 완료!");
        // onConfirm({
        //   symbol: stockData.symbol,
        //   price: stockData.currentPrice,
        //   quantity: Number(quantity),
        // });
        onClose();
      } else {
        const err = await res.json();
        alert(err.detail || "매수 실패");
      }
    } catch (error) {
      console.error("매수 요청 실패:", error);
    }
  };

  const totalCost = stockData.currentPrice * quantity;
  const insufficientFunds = balance !== null && totalCost > balance;

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">💰 매수 확인</h2>

        <p className="mb-2">
          현재가: <strong>${stockData.currentPrice.toLocaleString()}</strong>
        </p>
        {balance !== null && (
          <p className="mb-2 text-sm text-gray-700">
            보유 잔고: <strong>${balance.toLocaleString()}</strong>
          </p>
        )}

        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full border rounded px-3 py-2 mb-2"
          placeholder="매수 수량"
        />

        <p className="text-sm mb-4">
          총 매수 금액: <strong>${totalCost.toLocaleString()}</strong>{" "}
          {insufficientFunds && (
            <span className="text-red-500 ml-2">잔고 부족</span>
          )}
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={insufficientFunds || quantity < 1}
            className={`px-4 py-2 rounded text-white ${
              insufficientFunds || quantity < 1
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            매수
          </button>
        </div>
      </div>
    </div>
  );
}
