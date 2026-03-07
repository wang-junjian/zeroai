'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx'
import type { Step } from '../types'

interface ExportToWordProps {
  projectName: string
  steps: Step[]
  selectedVersion?: any
  requirements?: string
}

export const ExportToWord: React.FC<ExportToWordProps> = ({
  projectName,
  steps,
  selectedVersion,
  requirements
}) => {
  const handleExport = async () => {
    try {
      // 创建 Word 文档内容
      const children: any[] = []

      // 添加标题
      children.push(
        new Paragraph({
          text: projectName,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 400,
          },
        })
      )

      // 添加项目信息部分
      children.push(
        new Paragraph({
          text: '项目信息',
          heading: HeadingLevel.HEADING_2,
          spacing: {
            before: 400,
            after: 200,
          },
        })
      )

      // 项目名称
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '项目名称：',
              bold: true,
            }),
            new TextRun(projectName),
          ],
          spacing: {
            after: 100,
          },
        })
      )

      // 项目需求
      if (requirements) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: '项目需求：',
                bold: true,
              }),
            ],
            spacing: {
              after: 100,
            },
          })
        )
        const reqLines = requirements.split('\n')
        reqLines.forEach((line: string) => {
          if (line.trim()) {
            children.push(
              new Paragraph({
                text: line,
                indent: {
                  left: 720,
                },
                spacing: {
                  after: 50,
                },
              })
            )
          }
        })
      }

      // 添加版本信息
      if (selectedVersion) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: '版本号：',
                bold: true,
              }),
              new TextRun(selectedVersion.version_number),
            ],
            spacing: {
              after: 100,
            },
          })
        )
        if (selectedVersion.version_name) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: '版本名称：',
                  bold: true,
                }),
                new TextRun(selectedVersion.version_name),
              ],
              spacing: {
                after: 100,
              },
            })
          )
        }
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: '创建时间：',
                bold: true,
              }),
              new TextRun(new Date(selectedVersion.create_time).toLocaleString('zh-CN')),
            ],
            spacing: {
              after: 200,
            },
          })
        )
      }

      // 添加分隔线
      children.push(
        new Paragraph({
          text: '',
          border: {
            bottom: {
              color: 'auto',
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
          spacing: {
            after: 400,
          },
        })
      )

      // 添加每个步骤的内容
      steps.forEach((step) => {
        // 步骤标题
        children.push(
          new Paragraph({
            text: `${step.name}`,
            heading: HeadingLevel.HEADING_2,
            spacing: {
              before: 400,
              after: 200,
            },
          })
        )

        // 步骤状态
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: '状态：',
                bold: true,
              }),
              new TextRun({
                text: step.status === 'approved' ? '已审核' :
                      step.status === 'reviewing' ? '待审核' :
                      step.status === 'generating' ? '生成中' :
                      step.status === 'failed' ? '失败' : '待开始',
                color: step.status === 'approved' ? '00AA00' :
                       step.status === 'failed' ? 'AA0000' : '0000AA',
              }),
            ],
            spacing: {
              after: 200,
            },
          })
        )

        // 步骤输出内容
        let content = ''
        if (step.detail?.output) {
          content = step.detail.output
        } else if (step.rawContent) {
          content = step.rawContent
        } else if (step.data) {
          content = step.data
        }

        if (content) {
          // 更好地解析 Markdown 内容
          const contentLines = content.split('\n')
          let inCodeBlock = false
          let codeBlockContent: string[] = []

          contentLines.forEach((line: string) => {
            // 检查代码块
            if (line.trim().startsWith('```')) {
              if (inCodeBlock) {
                // 结束代码块
                if (codeBlockContent.length > 0) {
                  codeBlockContent.forEach((codeLine) => {
                    children.push(
                      new Paragraph({
                        text: codeLine,
                        shading: {
                          fill: 'F0F0F0',
                        },
                        indent: {
                          left: 360,
                        },
                        spacing: {
                          after: 20,
                        },
                      })
                    )
                  })
                  codeBlockContent = []
                }
                inCodeBlock = false
              } else {
                // 开始代码块
                inCodeBlock = true
              }
              return
            }

            if (inCodeBlock) {
              codeBlockContent.push(line)
              return
            }

            if (line.trim()) {
              // 处理标题
              if (line.startsWith('### ')) {
                children.push(
                  new Paragraph({
                    text: line.slice(4),
                    heading: HeadingLevel.HEADING_3,
                    spacing: {
                      before: 200,
                      after: 100,
                    },
                  })
                )
              } else if (line.startsWith('## ')) {
                children.push(
                  new Paragraph({
                    text: line.slice(3),
                    heading: HeadingLevel.HEADING_2,
                    spacing: {
                      before: 300,
                      after: 100,
                    },
                  })
                )
              } else if (line.startsWith('# ')) {
                children.push(
                  new Paragraph({
                    text: line.slice(2),
                    heading: HeadingLevel.HEADING_1,
                    spacing: {
                      before: 400,
                      after: 200,
                    },
                  })
                )
              } else if (line.startsWith('- ') || line.startsWith('* ')) {
                // 列表项
                children.push(
                  new Paragraph({
                    text: line.slice(2),
                    bullet: {
                      level: 0,
                    },
                    spacing: {
                      after: 50,
                    },
                  })
                )
              } else if (line.match(/^\d+\.\s/)) {
                // 有序列表
                children.push(
                  new Paragraph({
                    text: line.replace(/^\d+\.\s/, ''),
                    numbering: {
                      reference: 'my-numbering',
                      level: 0,
                    },
                    spacing: {
                      after: 50,
                    },
                  })
                )
              } else if (line.startsWith('> ')) {
                // 引用
                children.push(
                  new Paragraph({
                    text: line.slice(2),
                    shading: {
                      fill: 'E8F4FD',
                    },
                    indent: {
                      left: 720,
                    },
                    spacing: {
                      after: 50,
                    },
                  })
                )
              } else if (line.trim() === '---' || line.trim() === '***') {
                // 分隔线
                children.push(
                  new Paragraph({
                    text: '',
                    border: {
                      bottom: {
                        color: 'auto',
                        space: 1,
                        style: BorderStyle.SINGLE,
                        size: 6,
                      },
                    },
                    spacing: {
                      before: 100,
                      after: 100,
                    },
                  })
                )
              } else {
                // 普通段落 - 处理粗体和斜体
                const runs: TextRun[] = []
                let currentText = ''
                let i = 0

                while (i < line.length) {
                  if (line.slice(i, i+2) === '**' || line.slice(i, i+2) === '__') {
                    // 粗体开始/结束
                    if (currentText) {
                      runs.push(new TextRun(currentText))
                      currentText = ''
                    }
                    i += 2
                    let endBold = line.indexOf(line.slice(i-2, i), i)
                    if (endBold === -1) endBold = line.length
                    const boldText = line.slice(i, endBold)
                    if (boldText) {
                      runs.push(new TextRun({ text: boldText, bold: true }))
                    }
                    i = endBold + 2
                  } else if (line[i] === '*' || line[i] === '_') {
                    // 斜体开始/结束
                    if (currentText) {
                      runs.push(new TextRun(currentText))
                      currentText = ''
                    }
                    const italicChar = line[i]
                    i += 1
                    let endItalic = line.indexOf(italicChar, i)
                    if (endItalic === -1) endItalic = line.length
                    const italicText = line.slice(i, endItalic)
                    if (italicText) {
                      runs.push(new TextRun({ text: italicText, italics: true }))
                    }
                    i = endItalic + 1
                  } else {
                    currentText += line[i]
                    i += 1
                  }
                }

                if (currentText) {
                  runs.push(new TextRun(currentText))
                }

                if (runs.length > 0) {
                  children.push(
                    new Paragraph({
                      children: runs,
                      spacing: {
                        after: 50,
                      },
                    })
                  )
                }
              }
            } else {
              // 空行
              children.push(new Paragraph({ text: '' }))
            }
          })
        }
      })

      // 创建文档
      const doc = new Document({
        numbering: {
          config: [
            {
              reference: 'my-numbering',
              levels: [
                {
                  level: 0,
                  format: 'decimal',
                  text: '%1.',
                  alignment: AlignmentType.LEFT,
                },
              ],
            },
          ],
        },
        sections: [
          {
            properties: {},
            children,
          },
        ],
      })

      // 生成并下载文档
      const blob = await Packer.toBlob(doc)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')

      // 构建文件名
      let fileName = projectName
      if (selectedVersion) {
        fileName += `_v${selectedVersion.version_number}`
        if (selectedVersion.version_name) {
          fileName += `_${selectedVersion.version_name}`
        }
      }

      // 移除文件名中的非法字符
      fileName = fileName.replace(/[<>:"/\\|?*]/g, '_')

      a.href = url
      a.download = `${fileName}.docx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('导出 Word 文档失败:', error)
      alert('导出 Word 文档失败，请稍后重试')
    }
  }

  return (
    <Button onClick={handleExport} size="sm">
      导出 Word
    </Button>
  )
}
