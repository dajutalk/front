import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import ChatSection from "./components/ChatSection";

export default function StockDetail() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [stockData, setStockData] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("연결 중...");
  const [wsRef, setWsRef] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatWs, setChatWs] = useState(null);

  // 채팅 WebSocket 연결 - 일단 비활성화
  useEffect(() => {
    console.log(`🔍 [${symbol}] 채팅 WebSocket 연결 시도 중...`);
    
    // 서버에서 채팅 엔드포인트가 준비되지 않은 것 같으니 임시로 비활성화
    // const chatSocket = new WebSocket(`ws://localhost:8000/ws/chat?symbol=${symbol}`);
    // setChatWs(chatSocket);

    // 임시 더미 메시지
    setMessages([
      {
        content: `${symbol} 종목에 대한 토론을 시작해보세요!`,
        username: "시스템",
        timestamp: new Date().toISOString()
      }
    ]);

    return () => {
      // chatSocket?.close();
    };
  }, [symbol]);

  const sendMessage = (content) => {
    console.log(`💬 [${symbol}] 메시지 전송 시도:`, content);
    
    // 임시로 로컬 메시지 추가 (서버 연결 전까지)
    const newMessage = {
      content,
      username: "사용자",
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMessage]);
    
    // if (chatWs && chatWs.readyState === WebSocket.OPEN) {
    //   chatWs.send(JSON.stringify(newMessage));
    // }
  };

  // 메인 데이터 수신용 useEffect
  useEffect(() => {
    console.log(`🚀 [${symbol}] StockDetail 컴포넌트 마운트됨`);
    
    // 메인 WebSocket으로 종목 타입 확인
    console.log(`🔍 [${symbol}] 메인 WebSocket 연결 시도 중...`);
    const mainWs = new WebSocket(`ws://localhost:8000/ws/main`);
    
    mainWs.onopen = () => {
      console.log(`✅ [${symbol}] 메인 WebSocket 연결 성공`);
      console.log(`📡 [${symbol}] get_latest 요청 전송 중...`);
      mainWs.send("get_latest");
    };

    mainWs.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log(`📨 [${symbol}] 메인에서 데이터 수신:`, message);
        
        if (message.type === "market_update" && message.data) {
          const { stocks = [], cryptos = [] } = message.data;
          console.log(`📊 [${symbol}] 받은 데이터 - 주식: ${stocks.length}개, 코인: ${cryptos.length}개`);
          
          // 주식에서 찾기
          const stockItem = stocks.find(item => item.symbol === symbol);
          // 암호화폐에서 찾기  
          const cryptoItem = cryptos.find(item => item.symbol === symbol);
          
          let targetItem = null;
          let isStock = false;
          
          if (stockItem) {
            targetItem = stockItem;
            isStock = true;
            console.log(`🎯 [${symbol}] 주식으로 발견됨:`, stockItem);
          } else if (cryptoItem) {
            targetItem = cryptoItem;
            isStock = false;
            console.log(`🎯 [${symbol}] 암호화폐로 발견됨:`, cryptoItem);
          }
          
          if (targetItem) {
            console.log(`✅ [${symbol}] 타겟 아이템 확정:`, targetItem);
            
            // 즉시 stockData 설정
            const newStockData = {
              symbol: targetItem.symbol,
              name: targetItem.symbol,
              currentPrice: parseFloat(targetItem.price),
              change: parseFloat(targetItem.change) || 0,
              changePercent: parseFloat(targetItem.changePercent) || 0,
              isStock: isStock
            };
            
            console.log(`📊 [${symbol}] stockData 설정:`, newStockData);
            setStockData(newStockData);
            
            // 히스토리 데이터 설정
            if (targetItem.history && targetItem.history.length > 0) {
              const historyData = targetItem.history.map(h => ({
                time: h.time.toString(),
                price: h.price
              }));
              console.log(`📈 [${symbol}] 히스토리 데이터 설정:`, historyData.length, '개');
              setPriceHistory(historyData);
            } else {
              // 히스토리가 없으면 현재 가격으로 시작
              const timeString = new Date().toLocaleTimeString("ko-KR", {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              });
              const initialData = [{ time: timeString, price: parseFloat(targetItem.price) }];
              console.log(`🆕 [${symbol}] 초기 차트 데이터 생성:`, initialData);
              setPriceHistory(initialData);
            }
            
            // 메인 연결 종료하고 개별 연결 시작
            console.log(`🔄 [${symbol}] 메인 연결 종료하고 개별 연결 시작`);
            mainWs.close();
            
            // 개별 종목용 WebSocket 연결
            const wsEndpoint = isStock 
              ? `ws://localhost:8000/ws/stocks?symbol=${symbol}`
              : `ws://localhost:8000/ws/crypto?symbol=${symbol}`;
              
            console.log(`🔗 [${symbol}] 개별 WebSocket 연결 시도:`, wsEndpoint);
            const ws = new WebSocket(wsEndpoint);
            setWsRef(ws);

            ws.onopen = () => {
              console.log(`✅ [${symbol}] 개별 WebSocket 연결 성공`);
              setConnectionStatus("연결됨");
              console.log(`📡 [${symbol}] 개별 get_latest 요청 전송`);
              ws.send("get_latest");
            };

            ws.onmessage = (event) => {
              console.log(`🔥 [${symbol}] 개별 WebSocket 원본 데이터:`, event.data);
              
              try {
                const message = JSON.parse(event.data);
                console.log(`🔥 [${symbol}] 개별 WebSocket 파싱된 메시지:`, message);
                console.log(`📋 [${symbol}] 메시지 타입:`, message.type);
                
                // 모든 가능한 데이터 구조 확인
                if (message.data) {
                  console.log(`📦 [${symbol}] message.data:`, message.data);
                  // 처리 로직...
                } else if (message.type === "market_update") {
                  console.log(`📦 [${symbol}] market_update:`, message);
                  // 처리 로직...
                } else {
                  console.log(`📦 [${symbol}] 직접 메시지 처리:`, message);
                  // 처리 로직...
                }
                
                // 실제 데이터 처리는 기존 로직 사용하되 더 많은 로깅 추가
                if (message.data) {
                  const data = message.data;
                  
                  // 가격 필드를 다양한 형태로 시도
                  const currentPrice = parseFloat(
                    data.current_price || 
                    data.price || 
                    data.c || 
                    data.p
                  );
                  
                  console.log(`💰 [${symbol}] 추출된 가격:`, {
                    current_price: data.current_price,
                    price: data.price,
                    c: data.c,
                    p: data.p,
                    finalPrice: currentPrice
                  });
                  
                  if (!isNaN(currentPrice)) {
                    const newStockData = {
                      symbol: data.symbol || symbol,
                      name: data.symbol || symbol,
                      currentPrice: currentPrice,
                      change: parseFloat(data.change || data.d) || 0,
                      changePercent: parseFloat(data.changePercent || data.dp) || 0,
                      isStock: isStock
                    };
                    
                    console.log(`📊 [${symbol}] 새 주식 데이터 설정:`, newStockData);
                    setStockData(newStockData);

                    // 히스토리 데이터 처리
                    if (data.history && data.history.length > 0) {
                      console.log(`📈 [${symbol}] 히스토리 데이터 발견:`, data.history.length, '개');
                      const historyData = data.history.map((h, index) => ({
                        time: h.time ? h.time.toString() : index.toString(),
                        price: parseFloat(h.price)
                      }));
                      setPriceHistory(historyData);
                      console.log(`✅ [${symbol}] 히스토리 데이터 설정 완료:`, historyData.length, '개');
                    } else {
                      console.log(`⚡ [${symbol}] 히스토리 없음, 실시간 데이터로 차트 구성`);
                      // 히스토리가 없으면 현재 가격으로 초기 데이터 생성
                      setPriceHistory(prev => {
                        console.log(`📝 [${symbol}] 기존 차트 데이터:`, prev.length, '개');
                        
                        if (prev.length === 0) {
                          // 첫 번째 데이터 포인트 생성
                          const timeString = new Date().toLocaleTimeString("ko-KR", {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          });
                          const newData = [{ time: timeString, price: currentPrice }];
                          console.log(`🆕 [${symbol}] 첫 번째 차트 데이터 생성:`, newData);
                          return newData;
                        } else {
                          // 기존 데이터에 새 포인트 추가
                          const lastPrice = prev[prev.length - 1]?.price;
                          console.log(`🔄 [${symbol}] 마지막 가격: ${lastPrice}, 새 가격: ${currentPrice}`);
                          
                          if (lastPrice !== currentPrice) {
                            const timeString = new Date().toLocaleTimeString("ko-KR", {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            });
                            const newData = [...prev, { time: timeString, price: currentPrice }].slice(-100);
                            console.log(`➕ [${symbol}] 새 데이터 포인트 추가, 총 ${newData.length}개`);
                            return newData;
                          } else {
                            console.log(`⏭️ [${symbol}] 가격 변화 없음, 차트 업데이트 생략`);
                          }
                        }
                        return prev;
                      });
                    }
                  } else {
                    console.error(`❌ [${symbol}] 유효하지 않은 가격 데이터:`, {
                      current_price: data.current_price,
                      price: data.price,
                      c: data.c,
                      p: data.p,
                      parsedPrice: currentPrice
                    });
                  }
                } else {
                  console.warn(`⚠️ [${symbol}] 처리할 데이터 없음. 원본 메시지:`, message);
                }
              } catch (error) {
                console.error(`💥 [${symbol}] 데이터 파싱 에러:`, error);
                console.error(`💥 [${symbol}] 원본 데이터:`, event.data);
              }
            };

            ws.onerror = (error) => {
              console.error(`🚨 [${symbol}] 개별 WebSocket 에러:`, error);
              setConnectionStatus("연결 오류");
            };

            ws.onclose = (event) => {
              console.log(`❌ [${symbol}] 개별 WebSocket 연결 종료. Code: ${event.code}, Reason: ${event.reason}`);
              setConnectionStatus("연결 끊김");
            };
          } else {
            console.warn(`⚠️ [${symbol}] 메인 데이터에서 종목을 찾을 수 없음`);
            setConnectionStatus("종목을 찾을 수 없음");
            mainWs.close();
          }
        }
      } catch (error) {
        console.error(`❌ [${symbol}] 메인 데이터 파싱 에러:`, error);
      }
    };

    mainWs.onerror = (error) => {
      console.error(`🚨 [${symbol}] 메인 WebSocket 에러:`, error);
      setConnectionStatus("연결 오류");
    };

    mainWs.onclose = (event) => {
      console.log(`❌ [${symbol}] 메인 WebSocket 연결 종료. Code: ${event.code}`);
    };

    return () => {
      console.log(`🧹 [${symbol}] 컴포넌트 언마운트, WebSocket 정리`);
      mainWs.close();
      if (wsRef) {
        wsRef.close();
      }
    };
  }, [symbol]);

  const goBack = () => {
    navigate('/');
  };

  if (!stockData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg mb-4">📊 {symbol} 데이터 로딩 중...</div>
          <div className={`px-3 py-1 rounded text-sm ${
            connectionStatus === "연결됨" ? "bg-green-100 text-green-800" :
            connectionStatus === "연결 중..." ? "bg-yellow-100 text-yellow-800" :
            "bg-red-100 text-red-800"
          }`}>
            {connectionStatus}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={goBack}
              className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              ← 전체 목록
            </button>
            <div className={`px-3 py-1 rounded text-sm ${
              connectionStatus === "연결됨" ? "bg-green-100 text-green-800" :
              connectionStatus === "연결 중..." ? "bg-yellow-100 text-yellow-800" :
              "bg-red-100 text-red-800"
            }`}>
              {connectionStatus}
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 종목 정보 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">{stockData.symbol}</h1>
              <p className="text-gray-600">{stockData.isStock ? '주식' : '암호화폐'}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">
                {stockData.isStock ? '$' : ''}{stockData.currentPrice.toLocaleString()}
                <span className="text-lg ml-2">{stockData.isStock ? 'USD' : 'USDT'}</span>
              </div>
              <div className={`text-lg ${stockData.change >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
                {stockData.change >= 0 ? '▲' : '▼'} {stockData.isStock ? '$' : ''}{Math.abs(stockData.change).toFixed(2)} 
                ({stockData.changePercent >= 0 ? '+' : ''}{stockData.changePercent.toFixed(2)}%)
              </div>
            </div>
          </div>
        </div>

        {/* 차트와 채팅을 나란히 배치 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 차트 섹션 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">실시간 가격 차트</h2>
            <div className="h-96">
              {priceHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceHistory}>
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      domain={["dataMin - 1", "dataMax + 1"]} 
                      tick={{ fontSize: 12 }}
                    />
                    <CartesianGrid stroke="#e0e0e0" />
                    <Tooltip 
                      formatter={(value) => [value.toLocaleString(), '가격']}
                      labelFormatter={(label) => `시간: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke={stockData.isStock ? "#10b981" : "#3b82f6"}
                      strokeWidth={3}
                      dot={false}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  차트 데이터 로딩 중...
                </div>
              )}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              데이터 포인트: {priceHistory.length}개 | 실시간 업데이트
            </div>
          </div>

          {/* 채팅 섹션 */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">{stockData.symbol} 실시간 토론</h2>
            </div>
            <ChatSection messages={messages} sendMessage={sendMessage} />
          </div>
        </div>
      </div>
    </div>
  );
}
