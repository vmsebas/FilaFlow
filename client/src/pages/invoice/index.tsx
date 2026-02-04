import { useState } from "react";
import { useUpdate, useList } from "@refinedev/core";
import { 
  Card, 
  Input, 
  Button, 
  Typography, 
  Alert, 
  List, 
  Tag, 
  Space,
  message,
  Divider
} from "antd";
import { 
  FileTextOutlined, 
  CheckCircleOutlined,
  WarningOutlined,
  EuroOutlined
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface ParsedFilament {
  sku: string;
  article_number: string;
  material: string;
  color: string;
  variant_code: string;
  price: number;
  weight: number;
}

interface Filament {
  id: number;
  name: string;
  material: string;
  article_number: string;
  price?: number;
}

export const InvoiceImport = () => {
  const [invoiceText, setInvoiceText] = useState("");
  const [parsedFilaments, setParsedFilaments] = useState<ParsedFilament[]>([]);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updated, setUpdated] = useState<string[]>([]);

  const { result: filamentsResult } = useList<Filament>({
    resource: "filament",
    pagination: { mode: "off" },
  });

  const { mutate: updateFilament } = useUpdate();

  const filaments = filamentsResult?.data || [];

  const parseInvoice = async () => {
    if (!invoiceText.trim()) {
      setError("Please paste invoice text first");
      return;
    }

    setParsing(true);
    setError(null);
    setParsedFilaments([]);

    try {
      const response = await fetch("/api/v1/invoice/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: invoiceText }),
      });

      const data = await response.json();

      if (data.success) {
        setParsedFilaments(data.filaments);
        if (data.filaments.length === 0) {
          setError("No filaments found in the invoice text");
        }
      } else {
        setError(data.message || "Failed to parse invoice");
      }
    } catch (err) {
      setError("Failed to connect to API");
    } finally {
      setParsing(false);
    }
  };

  const findMatchingFilament = (articleNumber: string): Filament | undefined => {
    return filaments.find(f => f.article_number === articleNumber);
  };

  const applyPrice = (parsed: ParsedFilament) => {
    const matching = findMatchingFilament(parsed.article_number);
    if (!matching) {
      message.warning(`Filament not found: ${parsed.article_number}. Scan the spool first.`);
      return;
    }

    updateFilament(
      {
        resource: "filament",
        id: matching.id,
        values: { price: parsed.price },
      },
      {
        onSuccess: () => {
          message.success(`Price updated: ${matching.name} → €${parsed.price}`);
          setUpdated([...updated, parsed.article_number]);
        },
        onError: () => {
          message.error("Failed to update price");
        },
      }
    );
  };

  const applyAll = () => {
    let count = 0;
    parsedFilaments.forEach(parsed => {
      const matching = findMatchingFilament(parsed.article_number);
      if (matching && !updated.includes(parsed.article_number)) {
        applyPrice(parsed);
        count++;
      }
    });
    if (count === 0) {
      message.info("No filaments to update. Scan your spools first.");
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <Title level={3}>
        <FileTextOutlined /> Import Invoice
      </Title>
      
      <Paragraph type="secondary">
        Paste your invoice text below to automatically extract filament prices.
        Currently supports Bambu Lab invoices.
      </Paragraph>

      <Card style={{ marginBottom: 24 }}>
        <TextArea
          rows={8}
          placeholder="Paste invoice text here...&#10;&#10;Example:&#10;PLA Basic SKU: A00-K0-1.75-1000-SPL Variant: Black (10101) / 1kg ... €10.26"
          value={invoiceText}
          onChange={(e) => setInvoiceText(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        
        <Space>
          <Button 
            type="primary" 
            onClick={parseInvoice}
            loading={parsing}
          >
            Parse Invoice
          </Button>
          <Button onClick={() => {
            setInvoiceText("");
            setParsedFilaments([]);
            setError(null);
            setUpdated([]);
          }}>
            Clear
          </Button>
        </Space>
      </Card>

      {error && (
        <Alert
          message={error}
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {parsedFilaments.length > 0 && (
        <Card 
          title={`Found ${parsedFilaments.length} filament(s)`}
          extra={
            <Button type="primary" onClick={applyAll}>
              Apply All Prices
            </Button>
          }
        >
          <List
            dataSource={parsedFilaments}
            renderItem={(item) => {
              const matching = findMatchingFilament(item.article_number);
              const isUpdated = updated.includes(item.article_number);
              
              return (
                <List.Item
                  actions={[
                    matching && !isUpdated ? (
                      <Button 
                        size="small" 
                        type="primary"
                        onClick={() => applyPrice(item)}
                      >
                        Apply
                      </Button>
                    ) : isUpdated ? (
                      <Tag color="green">
                        <CheckCircleOutlined /> Updated
                      </Tag>
                    ) : (
                      <Tag color="orange">
                        <WarningOutlined /> Not scanned
                      </Tag>
                    )
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <div 
                        style={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: 8,
                          backgroundColor: `#${item.color === 'Black' ? '1a1a1a' : item.color === 'White' ? 'f0f0f0' : '888'}`,
                          border: '1px solid #ddd'
                        }} 
                      />
                    }
                    title={
                      <Space>
                        <Text strong>{item.material}</Text>
                        <Text>{item.color}</Text>
                        <Tag><EuroOutlined /> {item.price.toFixed(2)}</Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary" code>{item.article_number}</Text>
                        {matching ? (
                          <Text type="success">
                            <CheckCircleOutlined /> Matches: {matching.name}
                            {matching.price && ` (current: €${matching.price})`}
                          </Text>
                        ) : (
                          <Text type="warning">
                            <WarningOutlined /> No matching spool found
                          </Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              );
            }}
          />
        </Card>
      )}

      <Divider />
      
      <Card size="small" style={{ backgroundColor: '#fafafa' }}>
        <Title level={5}>Supported Invoice Formats</Title>
        <Paragraph type="secondary">
          <strong>Bambu Lab</strong> (store.bambulab.com)
          <br />
          Copy the invoice email or PDF text and paste it above.
          The parser looks for filament lines with SKU and price.
        </Paragraph>
      </Card>
    </div>
  );
};

export default InvoiceImport;
