import React, { useState, useEffect } from "react";

interface MaintenanceData {
  type: string;
  reason: string;
  responsible: string;
  startTime: string;
  endTime: string;
  progress: { time: string; status: string }[];
  sns: { name: string; url: string }[];
}

const Maintenance: React.FC = () => {
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceData | null>(null);
  const [progressWidth, setProgressWidth] = useState<number>(0);
  const [message, setMessage] = useState<string>("現在メンテナンス中です");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [showLogin, setShowLogin] = useState<boolean>(false);

  useEffect(() => {
    fetch("maintenance.json", { cache: "no-cache" })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTPエラー: ${response.status}`);
        return response.json();
      })
      .then((data: MaintenanceData) => {
        if (data.type === "緊急") {
          window.location.href = "emergency.html";
          return;
        }
        setMaintenanceData(data);
        updateProgress(data.progress);
      })
      .catch((error) => console.error("JSONの読み込みに失敗:", error));
  }, []);

  const updateProgress = (progressData: { time: string; status: string }[]) => {
    progressData.forEach((step, index) => {
      setTimeout(() => {
        const progressPercentage = ((index + 1) * 100) / progressData.length;
        setProgressWidth(progressPercentage);
        if (progressPercentage >= 50 && progressPercentage < 90) {
          setMessage("メンテナンスが50%完了しました。もう少しです！");
        } else if (progressPercentage >= 90 && progressPercentage < 100) {
          setMessage("メンテナンスが90%完了しました。あと少しお待ちください！");
        } else if (progressPercentage >= 100) {
          setMessage("メンテナンスが完了しました！");
        }
      }, index * 2000);
    });
  };

  const handleLogin = () => {
    if (password === "admin") {
      setIsLoggedIn(true);
      setShowLogin(false);
    } else {
      alert("パスワードが違います");
    }
  };

  return (
    <div className="flex flex-col items-center text-white min-h-screen bg-gradient-to-r from-gray-800 to-blue-500">
      <h1 className="text-3xl font-bold my-4">{message}</h1>
      {!isLoggedIn ? (
        <>
          <button className="bg-yellow-500 p-2 rounded mb-2" onClick={() => setShowLogin(!showLogin)}>
            {showLogin ? "閉じる" : "ログイン"}
          </button>
          {showLogin && (
            <div className="mb-4">
              <input
                type="password"
                className="p-2 border rounded text-black"
                placeholder="管理者パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button className="ml-2 bg-yellow-500 p-2 rounded" onClick={handleLogin}>
                ログイン
              </button>
            </div>
          )}
        </>
      ) : maintenanceData ? (
        <>
          <p>メンテナンスの種類: <strong>{maintenanceData.type}</strong></p>
          <p>理由: <strong>{maintenanceData.reason}</strong></p>
          <p>担当者: <strong>{maintenanceData.responsible}</strong></p>
          <p>開始時刻: {maintenanceData.startTime}</p>
          <p>終了予定時刻: {maintenanceData.endTime}</p>
          <div className="w-4/5 bg-gray-300 rounded mt-4">
            <div
              className="h-6 text-center text-white bg-green-500"
              style={{ width: `${progressWidth}%` }}
            >
              {progressWidth.toFixed(0)}%
            </div>
          </div>
          <h2 className="mt-4">進捗状況</h2>
          <ul>
            {maintenanceData.progress.map((p, index) => (
              <li key={index}>{p.time} - {p.status}</li>
            ))}
          </ul>
          <h2 className="mt-4">SNS情報</h2>
          <ul>
            {maintenanceData.sns.map((sns, index) => (
              <li key={index}>
                <a href={sns.url} target="_blank" rel="noopener noreferrer" className="text-yellow-400">
                  {sns.name}
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>データを読み込んでいます...</p>
      )}
    </div>
  );
};

export default Maintenance;
