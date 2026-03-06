'use client';

import { useState } from 'react';

export default function Home() {
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [interfaces, setInterfaces] = useState('');
  const [database, setDatabase] = useState('');
  const [businessLogic, setBusinessLogic] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyzeRequirements = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });

      const data = await response.json();

      if (data.code === '000000') {
        setRequirements(data.data);
        setStep(2);
      } else {
        setError(data.msg);
      }
    } catch (error) {
      setError('分析需求失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDesignInterfaces = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/design/interfaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requirements }),
      });

      const data = await response.json();

      if (data.code === '000000') {
        setInterfaces(data.data);
        setStep(3);
      } else {
        setError(data.msg);
      }
    } catch (error) {
      setError('设计接口失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDesignDatabase = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/design/database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requirements }),
      });

      const data = await response.json();

      if (data.code === '000000') {
        setDatabase(data.data);
        setStep(4);
      } else {
        setError(data.msg);
      }
    } catch (error) {
      setError('设计数据库失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDesignBusinessLogic = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/design/business-logic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interfaces }),
      });

      const data = await response.json();

      if (data.code === '000000') {
        setBusinessLogic(data.data);
        setStep(5);
      } else {
        setError(data.msg);
      }
    } catch (error) {
      setError('设计业务逻辑失败');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate/code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requirements, interfaces, businessLogic }),
      });

      const data = await response.json();

      if (data.code === '000000') {
        setCode(data.data);
        setStep(6);
      } else {
        setError(data.msg);
      }
    } catch (error) {
      setError('生成代码失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">🚀 ZeroAI - 自动软件开发平台</h1>

        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">📝 步骤1：输入项目描述</h2>
              <p className="mb-4 text-gray-600">请详细描述你的软件项目需求，包括功能特性、技术要求、用户需求等。</p>
              <textarea
                className="w-full p-4 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={8}
                placeholder="例如：我想开发一个坦克大战游戏，支持玩家控制坦克移动、射击，AI敌方坦克自动移动和射击，地图元素包括砖墙、钢墙、水域、树林、基地等，支持道具系统和关卡系统..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <button
                className="w-full py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-300 disabled:cursor-not-allowed"
                onClick={handleAnalyzeRequirements}
                disabled={loading || description.trim() === ''}
              >
                {loading ? '分析中...' : '分析需求'}
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">📋 步骤2：需求分析结果</h2>
              <p className="mb-4 text-gray-600">AI已经分析了你的项目需求，请查看以下结果。</p>
              <div className="w-full p-4 border border-gray-300 rounded-md mb-4 bg-gray-50">
                <pre className="text-sm overflow-x-auto">{requirements}</pre>
              </div>
              <button
                className="w-full py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-300 disabled:cursor-not-allowed"
                onClick={handleDesignInterfaces}
                disabled={loading}
              >
                {loading ? '设计中...' : '设计接口'}
              </button>
              <button
                className="w-full py-2 mt-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                onClick={() => setStep(1)}
              >
                上一步
              </button>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">🔌 步骤3：接口设计结果</h2>
              <p className="mb-4 text-gray-600">AI已经设计了软件系统的接口，请查看以下结果。</p>
              <div className="w-full p-4 border border-gray-300 rounded-md mb-4 bg-gray-50">
                <pre className="text-sm overflow-x-auto">{interfaces}</pre>
              </div>
              <button
                className="w-full py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-300 disabled:cursor-not-allowed"
                onClick={handleDesignDatabase}
                disabled={loading}
              >
                {loading ? '设计中...' : '设计数据库'}
              </button>
              <button
                className="w-full py-2 mt-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                onClick={() => setStep(2)}
              >
                上一步
              </button>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">🗄️ 步骤4：数据库设计结果</h2>
              <p className="mb-4 text-gray-600">AI已经设计了软件系统的数据库结构，请查看以下结果。</p>
              <div className="w-full p-4 border border-gray-300 rounded-md mb-4 bg-gray-50">
                <pre className="text-sm overflow-x-auto">{database}</pre>
              </div>
              <button
                className="w-full py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-300 disabled:cursor-not-allowed"
                onClick={handleDesignBusinessLogic}
                disabled={loading}
              >
                {loading ? '设计中...' : '设计业务逻辑'}
              </button>
              <button
                className="w-full py-2 mt-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                onClick={() => setStep(3)}
              >
                上一步
              </button>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">🔧 步骤5：业务逻辑设计结果</h2>
              <p className="mb-4 text-gray-600">AI已经设计了软件系统的业务逻辑，请查看以下结果。</p>
              <div className="w-full p-4 border border-gray-300 rounded-md mb-4 bg-gray-50">
                <pre className="text-sm overflow-x-auto">{businessLogic}</pre>
              </div>
              <button
                className="w-full py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-300 disabled:cursor-not-allowed"
                onClick={handleGenerateCode}
                disabled={loading}
              >
                {loading ? '生成中...' : '生成代码'}
              </button>
              <button
                className="w-full py-2 mt-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                onClick={() => setStep(4)}
              >
                上一步
              </button>
            </div>
          )}

          {step === 6 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">💻 步骤6：生成代码结果</h2>
              <p className="mb-4 text-gray-600">AI已经生成了软件源代码，请查看以下结果。</p>
              <div className="w-full p-4 border border-gray-300 rounded-md mb-4 bg-gray-50">
                <pre className="text-sm overflow-x-auto">{code}</pre>
              </div>
              <button
                className="w-full py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                onClick={() => window.location.reload()}
              >
                开始新项目
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-300 rounded-md text-red-700">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
