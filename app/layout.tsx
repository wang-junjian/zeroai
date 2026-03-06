import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZeroAI - 自动软件开发平台",
  description: "ZeroAI是一个自动软件开发平台，能够按照五步流程分析需求、设计接口、设计数据库、设计业务逻辑和生成代码。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
