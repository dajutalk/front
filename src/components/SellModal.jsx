import React, { useState, useEffect } from "react";

const API_URL = process.env.REACT_APP_API_URL;

export default function SellModal({ open, onClose, stockData, onConfirm }) {
  const [quantity, setQuantity] = useState(1);
  const [holdingQuantity, setHoldingQuantity] = useState(null);

  useEffect(() => {
    if (open) {
      fetch(`${API_URL}/api/mock-investment/holdings?symbol=${stockData.symbol}`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          setHoldingQuantity(data.quantity);
        })
        .catch((err) => {
          console.error("보유 수량 조회 실패:", err);
        });
    }
  }, [open, stockData.symbol]);

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${API_URL}/api/mock-investment/sell`, {
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
        alert("매도 완료!");
        // onConfirm({
        //     symbol: stockData.symbol,
        //     price: stockData.currentPrice,
        //     quantity: Number(quantity),
        // });
        onClose();
      } else {
        const err = await res.json();
        alert(err.detail || "매도 실패");
      }
    } catch (error) {
      console.error("매도 요청 실패:", error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">📤 매도 확인</h2>

        <p className="mb-2">
          현재가: <strong>${stockData.currentPrice.toLocaleString()}</strong>
        </p>
        {holdingQuantity !== null && (
          <p className="mb-2 text-sm text-gray-700">
            보유 수량: <strong>{holdingQuantity.toLocaleString()}개</strong>
          </p>
        )}

        <input
          type="number"
          min="1"
          max={holdingQuantity || 1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
          placeholder="매도 수량"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={Number(quantity) > holdingQuantity}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            매도
          </button>
        </div>
      </div>
    </div>
  );
}
