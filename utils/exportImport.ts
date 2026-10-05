import { Page, Block } from '../types/notion';

export function pageToMarkdown(page: Page): string {
  let md = '';

  md += `# ${page.title || 'Untitled'}\n\n`;

  if (page.isDatabase && page.database) {
    md += `## Database: ${page.database.title}\n\n`;
    const props = page.database.properties;
    md += `| Title | ${props.map((p) => p.name).join(' | ')} |\n`;
    md += `| --- | ${props.map(() => '---').join(' | ')} |\n`;

    page.database.items.forEach((item) => {
      const rowProps = props.map((p) => item.properties[p.id] ?? '-');
      md += `| ${item.title || 'Untitled'} | ${rowProps.join(' | ')} |\n`;
    });
    return md;
  }

  const blocks = page.blocks || [];
  blocks.forEach((block) => {
    switch (block.type) {
      case 'heading_1':
        md += `# ${block.content}\n\n`;
        break;
      case 'heading_2':
        md += `## ${block.content}\n\n`;
        break;
      case 'heading_3':
        md += `### ${block.content}\n\n`;
        break;
      case 'todo':
        md += `- [${block.checked ? 'x' : ' '}] ${block.content}\n`;
        break;
      case 'bulleted_list':
        md += `- ${block.content}\n`;
        break;
      case 'numbered_list':
        md += `1. ${block.content}\n`;
        break;
      case 'quote':
        md += `> ${block.content}\n\n`;
        break;
      case 'callout':
        md += `> **${block.meta?.calloutIcon || '💡'} Note:** ${block.content}\n\n`;
        break;
      case 'code':
        md += `\`\`\`${block.meta?.language || ''}\n${block.content}\n\`\`\`\n\n`;
        break;
      case 'divider':
        md += `---\n\n`;
        break;
      case 'table':
        if (block.meta?.tableData && block.meta.tableData.length > 0) {
          const header = block.meta.tableData[0];
          md += `| ${header.join(' | ')} |\n`;
          md += `| ${header.map(() => '---').join(' | ')} |\n`;
          block.meta.tableData.slice(1).forEach((row) => {
            md += `| ${row.join(' | ')} |\n`;
          });
          md += '\n';
        }
        break;
      case 'bookmark':
        md += `[${block.meta?.bookmarkTitle || 'Bookmark'}](${block.meta?.bookmarkUrl || '#'})\n\n`;
        break;
      case 'paragraph':
      default:
        md += `${block.content}\n\n`;
        break;
    }
  });

  return md;
}

export function downloadFile(filename: string, content: string, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
