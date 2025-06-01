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

  // 채팅 WebSocket 연결
  useEffect(() => {
    console.log(`🔍 [${symbol}] 채팅 WebSocket 연결 시도 중...`);
    
    // 로그인된 사용자 정보 가져오기
    const getUserInfo = async () => {
      try {
        const response = await fetch('http://localhost:8000/auth/me', {
          credentials: 'include'
        });
        
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
      }
      
      // 로그인되지 않은 경우 기본값
      return {
        nickname: `게스트${Math.floor(Math.random() * 1000)}`,
        user_id: `guest_${Date.now()}`
      };
    };
    
    const initializeChat = async () => {
      const userInfo = await getUserInfo();
      const nickname = encodeURIComponent(userInfo.nickname);
      const userId = userInfo.user_id || userInfo.id;
      
      console.log(`👤 [${symbol}] 사용자 정보:`, userInfo);
      
      const chatSocket = new WebSocket(`ws://localhost:8000/ws/chat/${symbol}?nickname=${nickname}&user_id=${userId}`);
      setChatWs(chatSocket);

      chatSocket.onopen = () => {
        console.log(`✅ [${symbol}] 채팅방 연결됨 (${userInfo.nickname})`);
      };

      chatSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log(`📨 [${symbol}] 채팅 메시지 수신:`, data);
          
          if (data.type === 'chat_message') {
            const newMessage = {
              content: data.data.message,
              username: data.data.nickname,
              timestamp: data.data.timestamp || new Date().toISOString(),
              userId: data.data.user_id,
              isOwn: data.data.user_id === userId,
              // 중복 방지를 위한 고유 ID 생성
              messageId: `${data.data.user_id}_${data.data.timestamp || Date.now()}_${data.data.message.slice(0, 10)}`
            };
            
            setMessages(prev => {
              // 같은 메시지 ID가 이미 있는지 확인
              const isDuplicate = prev.some(msg => msg.messageId === newMessage.messageId);
              if (isDuplicate) {
                console.log(`⚠️ [${symbol}] 중복 메시지 감지, 무시:`, newMessage.content);
                return prev;
              }
              return [...prev.slice(-99), newMessage];
            });
            
          } else if (data.type === 'user_joined') {
            const joinMessage = {
              content: data.data.message,
              username: "시스템",
              timestamp: new Date().toISOString(),
              isSystem: true,
              messageId: `system_join_${Date.now()}_${data.data.message}`
            };
            
            setMessages(prev => {
              // 시스템 메시지 중복 방지
              const isDuplicate = prev.some(msg => 
                msg.isSystem && msg.content === joinMessage.content && 
                Math.abs(new Date(msg.timestamp) - new Date(joinMessage.timestamp)) < 1000
              );
              if (isDuplicate) {
                return prev;
              }
              return [...prev.slice(-99), joinMessage];
            });
            
          } else if (data.type === 'user_left') {
            const leaveMessage = {
              content: data.data.message,
              username: "시스템", 
              timestamp: new Date().toISOString(),
              isSystem: true,
              messageId: `system_leave_${Date.now()}_${data.data.message}`
            };
            
            setMessages(prev => {
              // 시스템 메시지 중복 방지
              const isDuplicate = prev.some(msg => 
                msg.isSystem && msg.content === leaveMessage.content && 
                Math.abs(new Date(msg.timestamp) - new Date(leaveMessage.timestamp)) < 1000
              );
              if (isDuplicate) {
                return prev;
              }
              return [...prev.slice(-99), leaveMessage];
            });
          }
        } catch (error) {
          console.error(`❌ [${symbol}] 채팅 메시지 파싱 에러:`, error);
        }
      };

      chatSocket.onerror = (error) => {
        console.error(`🚨 [${symbol}] 채팅 WebSocket 에러:`, error);
      };

      chatSocket.onclose = (event) => {
        console.log(`❌ [${symbol}] 채팅 WebSocket 연결 종료. Code: ${event.code}`);
      };
    };
    
    initializeChat();

    // 초기 환영 메시지
    setMessages([
      {
        content: `${symbol} 채팅방에 오신 것을 환영합니다! 실시간으로 다른 투자자들과 소통해보세요.`,
        username: "시스템",
        timestamp: new Date().toISOString(),
        isSystem: true
      }
    ]);

    return () => {
      if (chatWs?.readyState === WebSocket.OPEN) {
        chatWs.close(1000, 'Component unmounting');
      }
    };
  }, [symbol]);

  const sendMessage = (content) => {
    if (!content.trim()) return;
    
    console.log(`💬 [${symbol}] 메시지 전송 시도:`, content);
    
    if (chatWs && chatWs.readyState === WebSocket.OPEN) {
      const messageData = {
        type: 'chat_message',
        message: content.trim()
      };
      
      // 서버로만 전송하고 로컬에는 추가하지 않음 (서버에서 받은 메시지로 표시)
      chatWs.send(JSON.stringify(messageData));
      console.log(`📤 [${symbol}] 메시지 전송됨:`, messageData);
    } else {
      console.warn(`⚠️ [${symbol}] WebSocket이 연결되지 않음`);
      
      // 연결이 안 된 경우에만 임시로 로컬 메시지 추가
      const fallbackMessage = {
        content: content + " (전송 실패 - 연결을 확인해주세요)",
        username: "나",
        timestamp: new Date().toISOString(),
        isError: true,
        isOwn: true
      };
      setMessages(prev => [...prev, fallbackMessage]);
    }
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
                
                // 메시지 타입별 처리
                if (message.type === 'crypto_update' && message.data) {
                  console.log(`💰 [${symbol}] 암호화폐 업데이트 처리`);
                  const data = message.data;
                  
                  const currentPrice = parseFloat(data.current_price);
                  if (!isNaN(currentPrice)) {
                    const newStockData = {
                      symbol: data.symbol || symbol,
                      name: data.symbol || symbol,
                      currentPrice: currentPrice,
                      change: parseFloat(data.change) || 0,
                      changePercent: parseFloat(data.changePercent) || 0,
                      isStock: false
                    };
                    
                    setStockData(prev => {
                      // 가격이 실제로 변경된 경우에만 업데이트
                      if (!prev || prev.currentPrice !== currentPrice) {
                        console.log(`📊 [${symbol}] 암호화폐 데이터 업데이트:`, newStockData);
                        return newStockData;
                      }
                      return prev;
                    });

                    // 히스토리 데이터 처리
                    if (data.history && data.history.length > 0) {
                      const historyData = data.history.map(h => ({
                        time: h.time.toString(),
                        price: parseFloat(h.price)
                      }));
                      setPriceHistory(prev => {
                        // 히스토리 길이가 다른 경우에만 업데이트
                        if (prev.length !== historyData.length) {
                          console.log(`📈 [${symbol}] 히스토리 데이터 업데이트:`, historyData.length, '개');
                          return historyData;
                        }
                        return prev;
                      });
                    }
                  }
                  
                } else if (message.type === 'stock_update' && message.data) {
                  console.log(`📈 [${symbol}] 주식 업데이트 처리`);
                  
                  // 주식 데이터는 배열 형태로 오므로 첫 번째 항목 사용
                  const stockItem = Array.isArray(message.data) ? message.data[0] : message.data;
                  
                  if (stockItem) {
                    const currentPrice = parseFloat(stockItem.p || stockItem.price || stockItem.c);
                    
                    if (!isNaN(currentPrice)) {
                      const newStockData = {
                        symbol: stockItem.s || stockItem.symbol || symbol,
                        name: stockItem.s || stockItem.symbol || symbol,
                        currentPrice: currentPrice,
                        change: parseFloat(stockItem.change || stockItem.d) || 0,
                        changePercent: parseFloat(stockItem.changePercent || stockItem.dp) || 0,
                        isStock: true
                      };
                      
                      setStockData(prev => {
                        // 가격이 실제로 변경된 경우에만 업데이트
                        if (!prev || prev.currentPrice !== currentPrice) {
                          console.log(`📊 [${symbol}] 주식 데이터 업데이트:`, newStockData);
                          return newStockData;
                        }
                        return prev;
                      });

                      // 실시간 가격 차트에 새 데이터 포인트 추가
                      setPriceHistory(prev => {
                        const lastPrice = prev[prev.length - 1]?.price;
                        if (lastPrice !== currentPrice) {
                          const timeString = new Date().toLocaleTimeString("ko-KR", {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          });
                          const newData = [...prev, { time: timeString, price: currentPrice }].slice(-50);
                          console.log(`➕ [${symbol}] 새 주식 데이터 포인트 추가`);
                          return newData;
                        }
                        return prev;
                      });
                    } else {
                      console.error(`❌ [${symbol}] 주식 가격 파싱 실패:`, stockItem);
                    }
                  }
                  
                } else {
                  console.warn(`⚠️ [${symbol}] 알 수 없는 메시지 타입:`, message.type);
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

  // 로그아웃 함수
  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:8000/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        console.log('✅ 로그아웃 성공');
        navigate('/login');
        window.location.reload();
      } else {
        console.error('❌ 로그아웃 실패');
        navigate('/login');
        window.location.reload();
      }
    } catch (error) {
      console.error('🚨 로그아웃 에러:', error);
      navigate('/login');
      window.location.reload();
    }
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
            
            <div className="flex items-center gap-4">
              <div className={`px-3 py-1 rounded text-sm ${
                connectionStatus === "연결됨" ? "bg-green-100 text-green-800" :
                connectionStatus === "연결 중..." ? "bg-yellow-100 text-yellow-800" :
                "bg-red-100 text-red-800"
              }`}>
                {connectionStatus}
              </div>
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                로그아웃
              </button>
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
