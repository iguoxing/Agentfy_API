import React, { useEffect, useState } from 'react';
import { Input, Button, Table, Tag, Card, Space, Pagination, Layout, Empty } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;

const KeywordRank = () => {
  const [data, setData] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sumTotalPv, setSumTotalPv] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const pageSize = 3;

  const fetchData = async () => {
    if (!keyword) {
      setData([]);
      setTotal(0);
      setSumTotalPv(0);
      setHasSearched(true);
      return;
    }
    setLoading(true);
    const response = await fetch('/api/keyword/word/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'B29A3CA8F93E4A50BA5DF8796BF6687B'
      },
      body: new URLSearchParams({
        keyword,
        page_index: pageIndex.toString(),
        page_size: pageSize.toString()
      })
    });
    const result = await response.json();
    let totalSum = 0;
    const processedData = result.data.word.map(item => {
      const totalPv = (item.bidword_pcpv || 0) + (item.bidword_wisepv || 0);
      totalSum += totalPv;
      return {
        ...item,
        total_pv: totalPv
      };
    });
    setSumTotalPv(totalSum);
    setData(processedData);
    setTotal(result.data.total);
    setHasSearched(true);
    setLoading(false);
  };

  useEffect(() => {
    if (keyword && hasSearched) fetchData();
  }, [pageIndex]);

  const handleSearch = () => {
    setPageIndex(1);
    fetchData();
  };

  const exportCSV = () => {
    if (data.length === 0) return;
    const csvRows = [
      ['Keyword', 'Index', 'Mobile Index', 'Haosou Index', 'Long Keyword Count', 'Bidword Company Count', 'Bidword PC PV', 'Bidword Wise PV', 'Total PV', 'Percentage', 'SEM Reason', 'SEM Price'],
      ...data.map(row => [
        row.keyword,
        row.index,
        row.mobile_index,
        row.haosou_index,
        row.long_keyword_count,
        row.bidword_company_count,
        row.bidword_pcpv,
        row.bidword_wisepv,
        row.total_pv,
        sumTotalPv > 0 ? ((row.total_pv / sumTotalPv) * 100).toFixed(2) + '%' : '0%',
        row.sem_reason,
        row.sem_price
      ])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'keyword_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      title: '关键词',
      dataIndex: 'keyword',
      key: 'keyword',
      render: text => <a className="text-blue-400 hover:text-blue-300">{text}</a>,
    },
    {
      title: '长尾词数量',
      dataIndex: 'long_keyword_count',
      key: 'long_keyword_count',
    },

    {
      title: 'PC检索量',
      dataIndex: 'bidword_pcpv',
      key: 'bidword_pcpv',
    },
    {
      title: '移动检索量',
      dataIndex: 'bidword_wisepv',
      key: 'bidword_wisepv',
    },
    {
      title: '总搜索量',
      dataIndex: 'total_pv',
      key: 'total_pv',
      sorter: (a, b) => a.total_pv - b.total_pv,
    },
    {
      title: '占比',
      key: 'percentage',
      render: (_, record) => (
        <span>
          {sumTotalPv > 0 ? ((record.total_pv / sumTotalPv) * 100).toFixed(2) + '%' : '0%'}
        </span>
      ),
      sorter: (a, b) => a.total_pv - b.total_pv,
    },
    {
      title: '竞价公司数',
      dataIndex: 'bidword_company_count',
      key: 'bidword_company_count',
    },
    {
      title: 'SEM原因',
      dataIndex: 'sem_reason',
      key: 'sem_reason',
      render: text => (
        text ? <Tag color="red">{text}</Tag> : '-'
      ),
    },
    {
      title: 'SEM价格',
      dataIndex: 'sem_price',
      key: 'sem_price',
    },
  ];

  const totalPages = Math.ceil(total / pageSize);


  const renderContent = () => {
    if (!hasSearched) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span style={{ fontSize: '16px' }}>
                请输入关键词开始搜索
              </span>
            }
          />
        </div>
      );
    }

    if (hasSearched && data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span style={{ color: '#e2e8f0', fontSize: '16px' }}>
                未找到相关关键词数据
              </span>
            }
          />
          <p style={{ color: '#94a3b8', marginTop: '16px', textAlign: 'center' }}>
            尝试使用其他关键词进行搜索
          </p>
        </div>
      );
    }

    return (
      <>
        <Table 
          columns={columns} 
          dataSource={data.map((item, index) => ({ ...item, key: index }))} 
          pagination={false}
          loading={loading}
          bordered
          size="middle"
          scroll={{ x: true, y: 'calc(100vh - 240px)' }}
          className="rounded-lg overflow-hidden"
        />
        
        <div className="flex justify-between items-center mt-6 px-6 py-4 bg-slate-800 rounded-lg shadow-sm" style={{marginTop: '12px'}}>
          <div>
            {total > 0 && (
              <span>
                共找到 <strong>{total}</strong> 条相关数据
              </span>
            )}
          </div>
          
          <Button 
            type="primary" 
            onClick={exportCSV}
            icon={<DownloadOutlined />}
            style={{ background: '#10b981', borderColor: '#10b981' }}
            className="hover:bg-green-600"
            disabled={data.length === 0}
          >
            导出CSV
          </Button>
        </div>
      </>
    );
  };

  return (
    <Layout className="min-h-screen">
      <Header className="flex items-center justify-between px-8 shadow-sm mt-6">
        <strong className="font-bold text-white m-0" style={{color: '#fff' }}>关键词排名</strong>
        <Space className="space-x-4">
          <Input
            placeholder="输入关键词..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 300 }}
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            onPressEnter={handleSearch}
          />
          <Button 
            type="primary" 
            onClick={handleSearch}
            icon={<SearchOutlined />}
          >
            搜索
          </Button>
        </Space>
      </Header>
      
      <Content className="!p-8 !bg-slate-900" style={{ 
          padding: '1rem'
        }}>
        <div className="rounded-lg overflow-hidden !p-12">
          {renderContent()}
        </div>
      </Content>
    </Layout>
  );

};

export default KeywordRank;