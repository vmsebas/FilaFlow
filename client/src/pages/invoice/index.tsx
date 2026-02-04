import { useState } from "react";
import { useCreate, useUpdate, useList } from "@refinedev/core";
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
  Divider,
  Modal,
  Form,
  InputNumber,
  Select
} from "antd";
import { 
  FileTextOutlined, 
  CheckCircleOutlined,
  WarningOutlined,
  EuroOutlined,
  PlusOutlined,
  ShoppingCartOutlined
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
  color_hex?: string;
  vendor?: {
    id: number;
    name: string;
  };
}

interface Vendor {
  id: number;
  name: string;
}

// Color mapping for common Bambu Lab colors
const COLOR_MAP: Record<string, string> = {
  'Black': '1a1a1a',
  'White': 'ffffff',
  'Red': 'e63946',
  'Blue': '1890ff',
  'Green': '2ecc71',
  'Yellow': 'f1c40f',
  'Orange': 'ff6b00',
  'Gray': '7f8c8d',
  'Grey': '7f8c8d',
  'Purple': '9b59b6',
  'Pink': 'ff69b4',
  'Brown': '8b4513',
  'Cyan': '00bcd4',
  'Magenta': 'ff00ff',
  'Lime': '00ff00',
  'Navy': '000080',
  'Teal': '008080',
  'Olive': '808000',
  'Maroon': '800000',
  'Silver': 'c0c0c0',
  'Gold': 'ffd700',
};

export const InvoiceImport = () => {
  const [invoiceText, setInvoiceText] = useState("");
  const [parsedFilaments, setParsedFilaments] = useState<ParsedFilament[]>([]);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updated, setUpdated] = useState<string[]>([]);
  const [added, setAdded] = useState<string[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedFilament, setSelectedFilament] = useState<ParsedFilament | null>(null);
  const [form] = Form.useForm();

  const { result: filamentsResult, query: filamentsQuery } = useList<Filament>({
    resource: "filament",
    pagination: { mode: "off" },
  });
  
  const refetchFilaments = () => filamentsQuery.refetch();

  const { result: vendorsResult } = useList<Vendor>({
    resource: "vendor",
    pagination: { mode: "off" },
  });

  const { mutate: updateFilament } = useUpdate();
  const { mutate: createFilament } = useCreate();
  const { mutate: createSpool } = useCreate();

  const filaments = filamentsResult?.data || [];
  const vendors = vendorsResult?.data || [];

  const parseInvoice = async () => {
    if (!invoiceText.trim()) {
      setError("Please paste invoice text first");
      return;
    }

    setParsing(true);
    setError(null);
    setParsedFilaments([]);
    setUpdated([]);
    setAdded([]);

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
      message.warning(`Filament not found: ${parsed.article_number}`);
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
          refetchFilaments();
        },
        onError: () => {
          message.error("Failed to update price");
        },
      }
    );
  };

  const openAddModal = (parsed: ParsedFilament) => {
    setSelectedFilament(parsed);
    
    // Find Bambu Lab vendor or first vendor
    const bambuVendor = vendors.find(v => v.name.toLowerCase().includes('bambu'));
    const defaultVendor = bambuVendor || vendors[0];
    
    form.setFieldsValue({
      name: parsed.color,
      material: parsed.material.split(' ')[0], // Just "PLA" not "PLA BASIC"
      color_hex: COLOR_MAP[parsed.color] || '808080',
      price: parsed.price,
      weight: parsed.weight,
      density: 1.24,
      diameter: 1.75,
      article_number: parsed.article_number,
      vendor_id: defaultVendor?.id,
      create_spool: true,
      spool_location: '',
    });
    
    setAddModalVisible(true);
  };

  const handleAddFilament = async () => {
    try {
      const values = await form.validateFields();
      
      // Create filament
      createFilament(
        {
          resource: "filament",
          values: {
            name: values.name,
            material: values.material,
            color_hex: values.color_hex,
            price: values.price,
            weight: values.weight,
            density: values.density,
            diameter: values.diameter,
            article_number: values.article_number,
            vendor_id: values.vendor_id,
          },
        },
        {
          onSuccess: (data) => {
            message.success(`Filament created: ${values.name}`);
            
            // Create spool if requested
            if (values.create_spool) {
              createSpool(
                {
                  resource: "spool",
                  values: {
                    filament_id: data.data.id,
                    initial_weight: values.weight,
                    used_weight: 0,
                    location: values.spool_location || '',
                  },
                },
                {
                  onSuccess: () => {
                    message.success(`Spool added to inventory`);
                  },
                }
              );
            }
            
            setAdded([...added, selectedFilament?.article_number || '']);
            setAddModalVisible(false);
            refetchFilaments();
          },
          onError: () => {
            message.error("Failed to create filament");
          },
        }
      );
    } catch (err) {
      // Form validation error
    }
  };

  const getColorHex = (colorName: string): string => {
    return COLOR_MAP[colorName] || '808080';
  };

  // Separate filaments into matched and unmatched
  const matchedFilaments = parsedFilaments.filter(f => findMatchingFilament(f.article_number));
  const unmatchedFilaments = parsedFilaments.filter(f => !findMatchingFilament(f.article_number) && !added.includes(f.article_number));
  const newlyAdded = parsedFilaments.filter(f => added.includes(f.article_number));

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <Title level={3}>
        <FileTextOutlined /> Import Invoice
      </Title>
      
      <Paragraph type="secondary">
        Paste your invoice text below to automatically extract filament prices and add new filaments to inventory.
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
            setAdded([]);
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

      {/* Purchased but not in inventory */}
      {unmatchedFilaments.length > 0 && (
        <Card 
          title={
            <Space>
              <ShoppingCartOutlined style={{ color: '#faad14' }} />
              <span>Purchased - Not in Inventory ({unmatchedFilaments.length})</span>
            </Space>
          }
          style={{ marginBottom: 24, borderColor: '#faad14' }}
        >
          <Alert
            message="These filaments are in your invoice but not yet in FilaFlow. Add them to start tracking!"
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <List
            dataSource={unmatchedFilaments}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button 
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => openAddModal(item)}
                  >
                    Add to Inventory
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <div 
                      style={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: 8,
                        backgroundColor: `#${getColorHex(item.color)}`,
                        border: '1px solid #ddd'
                      }} 
                    />
                  }
                  title={
                    <Space>
                      <Text strong>{item.material}</Text>
                      <Text>{item.color}</Text>
                      <Tag color="green"><EuroOutlined /> {item.price.toFixed(2)}</Tag>
                      <Tag>{item.weight}g</Tag>
                    </Space>
                  }
                  description={<Text type="secondary" code>{item.article_number}</Text>}
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* Already in inventory - update prices */}
      {matchedFilaments.length > 0 && (
        <Card 
          title={
            <Space>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <span>In Inventory ({matchedFilaments.length})</span>
            </Space>
          }
          extra={
            <Button 
              type="primary" 
              onClick={() => {
                matchedFilaments.forEach(f => {
                  if (!updated.includes(f.article_number)) {
                    applyPrice(f);
                  }
                });
              }}
            >
              Update All Prices
            </Button>
          }
          style={{ marginBottom: 24 }}
        >
          <List
            dataSource={matchedFilaments}
            renderItem={(item) => {
              const matching = findMatchingFilament(item.article_number);
              const isUpdated = updated.includes(item.article_number);
              
              return (
                <List.Item
                  actions={[
                    isUpdated ? (
                      <Tag color="green">
                        <CheckCircleOutlined /> Updated
                      </Tag>
                    ) : (
                      <Button 
                        size="small" 
                        type="primary"
                        onClick={() => applyPrice(item)}
                      >
                        Update Price
                      </Button>
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
                          backgroundColor: `#${getColorHex(item.color)}`,
                          border: '1px solid #ddd'
                        }} 
                      />
                    }
                    title={
                      <Space>
                        <Text strong>{item.material}</Text>
                        <Text>{item.color}</Text>
                        <Tag color="green"><EuroOutlined /> {item.price.toFixed(2)}</Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary" code>{item.article_number}</Text>
                        {matching && (
                          <Text type="success">
                            <CheckCircleOutlined /> {matching.name}
                            {matching.price && ` (current: €${matching.price})`}
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

      {/* Newly added */}
      {newlyAdded.length > 0 && (
        <Card 
          title={
            <Space>
              <PlusOutlined style={{ color: '#1890ff' }} />
              <span>Just Added ({newlyAdded.length})</span>
            </Space>
          }
          style={{ marginBottom: 24, borderColor: '#1890ff' }}
        >
          <List
            dataSource={newlyAdded}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <div 
                      style={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: 8,
                        backgroundColor: `#${getColorHex(item.color)}`,
                        border: '1px solid #ddd'
                      }} 
                    />
                  }
                  title={
                    <Space>
                      <Text strong>{item.material}</Text>
                      <Text>{item.color}</Text>
                      <Tag color="blue"><PlusOutlined /> Added</Tag>
                    </Space>
                  }
                  description={<Text type="secondary" code>{item.article_number}</Text>}
                />
              </List.Item>
            )}
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
        </Paragraph>
      </Card>

      {/* Add Filament Modal */}
      <Modal
        title="Add Filament to Inventory"
        open={addModalVisible}
        onOk={handleAddFilament}
        onCancel={() => setAddModalVisible(false)}
        okText="Add Filament"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          
          <Form.Item name="material" label="Material" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="PLA">PLA</Select.Option>
              <Select.Option value="PETG">PETG</Select.Option>
              <Select.Option value="ABS">ABS</Select.Option>
              <Select.Option value="ASA">ASA</Select.Option>
              <Select.Option value="TPU">TPU</Select.Option>
              <Select.Option value="PA">PA (Nylon)</Select.Option>
              <Select.Option value="PC">PC</Select.Option>
              <Select.Option value="PVA">PVA</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="vendor_id" label="Vendor">
            <Select>
              {vendors.map(v => (
                <Select.Option key={v.id} value={v.id}>{v.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Space style={{ width: '100%' }}>
            <Form.Item name="price" label="Price (€/kg)" rules={[{ required: true }]}>
              <InputNumber min={0} step={0.01} style={{ width: 120 }} />
            </Form.Item>
            
            <Form.Item name="weight" label="Weight (g)" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: 120 }} />
            </Form.Item>
          </Space>
          
          <Form.Item name="color_hex" label="Color (hex)" rules={[{ required: true }]}>
            <Input prefix="#" maxLength={6} />
          </Form.Item>
          
          <Form.Item name="article_number" label="Article Number">
            <Input disabled />
          </Form.Item>
          
          <Form.Item name="density" hidden>
            <InputNumber />
          </Form.Item>
          
          <Form.Item name="diameter" hidden>
            <InputNumber />
          </Form.Item>
          
          <Divider />
          
          <Form.Item name="create_spool" valuePropName="checked" initialValue={true}>
            <Select defaultValue={true}>
              <Select.Option value={true}>Also create a spool (recommended)</Select.Option>
              <Select.Option value={false}>Only create filament type</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="spool_location" label="Spool Location (optional)">
            <Input placeholder="e.g., Shelf A1, Storage Box" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InvoiceImport;
