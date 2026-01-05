import React from "react";

const normalizeText = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
};

const renderInline = (text) => {
  const input = normalizeText(text);
  const nodes = [];
  let i = 0;

  const pushText = (value) => {
    if (!value) return;
    nodes.push(value);
  };

  while (i < input.length) {
    if (input.startsWith("**", i)) {
      const end = input.indexOf("**", i + 2);
      if (end !== -1) {
        const content = input.slice(i + 2, end);
        nodes.push(
          <strong key={`b-${i}`}>{renderInline(content)}</strong>
        );
        i = end + 2;
        continue;
      }
    }

    if (input[i] === "`") {
      const end = input.indexOf("`", i + 1);
      if (end !== -1) {
        const content = input.slice(i + 1, end);
        nodes.push(<code key={`c-${i}`}>{content}</code>);
        i = end + 1;
        continue;
      }
    }

    const nextBold = input.indexOf("**", i);
    const nextCode = input.indexOf("`", i);
    const next = [nextBold, nextCode].filter((n) => n !== -1).sort((a, b) => a - b)[0];

    if (next === undefined) {
      pushText(input.slice(i));
      break;
    }

    pushText(input.slice(i, next));
    i = next;
  }

  return nodes;
};

const parseBlocks = (content) => {
  const lines = normalizeText(content).split("\n");
  const blocks = [];
  let paragraphLines = [];

  const flushParagraph = () => {
    const text = paragraphLines.join("\n").trimEnd();
    paragraphLines = [];
    if (!text.trim()) return;
    blocks.push({ type: "paragraph", text });
  };

  const isHr = (line) => {
    const t = line.trim();
    return t === "---" || t === "***";
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      continue;
    }

    if (isHr(line)) {
      flushParagraph();
      blocks.push({ type: "hr" });
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2],
      });
      continue;
    }

    const ulMatch = trimmed.match(/^-+\s+(.*)$/);
    if (ulMatch) {
      flushParagraph();
      const items = [];
      let j = index;
      while (j < lines.length) {
        const m = lines[j].trim().match(/^-+\s+(.*)$/);
        if (!m) break;
        items.push(m[1]);
        j += 1;
      }
      blocks.push({ type: "ul", items });
      index = j - 1;
      continue;
    }

    const olMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      flushParagraph();
      const items = [];
      let j = index;
      while (j < lines.length) {
        const m = lines[j].trim().match(/^\d+\.\s+(.*)$/);
        if (!m) break;
        items.push(m[1]);
        j += 1;
      }
      blocks.push({ type: "ol", items });
      index = j - 1;
      continue;
    }

    paragraphLines.push(line);
  }

  flushParagraph();
  return blocks;
};

const Paragraph = ({ text }) => {
  const parts = normalizeText(text).split("\n");
  return (
    <p className="fm-paragraph">
      {parts.map((part, idx) => (
        <React.Fragment key={idx}>
          {renderInline(part)}
          {idx < parts.length - 1 ? <br /> : null}
        </React.Fragment>
      ))}
    </p>
  );
};

const FormattedMessage = ({ content }) => {
  const blocks = parseBlocks(content);

  return (
    <div className="fm-root">
      {blocks.map((block, idx) => {
        if (block.type === "hr") {
          return <hr key={`hr-${idx}`} className="fm-hr" />;
        }

        if (block.type === "heading") {
          const Tag = `h${Math.min(Math.max(block.level + 1, 3), 6)}`;
          return (
            <Tag key={`h-${idx}`} className="fm-heading">
              {renderInline(block.text)}
            </Tag>
          );
        }

        if (block.type === "ul") {
          return (
            <ul key={`ul-${idx}`} className="fm-list">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }

        if (block.type === "ol") {
          return (
            <ol key={`ol-${idx}`} className="fm-list">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx}>{renderInline(item)}</li>
              ))}
            </ol>
          );
        }

        return <Paragraph key={`p-${idx}`} text={block.text} />;
      })}
    </div>
  );
};

export default FormattedMessage;

