'''
Author: ArdenZhao
Date: 2025-05-01 15:48:04
LastEditTime: 2025-05-01 15:48:21
FilePath: /Agentfy_API/growth/ringsKeyword.py
Description: 冠军戒指相近关键词查找
'''
# 导入必要的库
import gensim
from gensim.models import Word2Vec, KeyedVectors
import logging

# 配置日志
logging.basicConfig(format='%(asctime)s : %(levelname)s : %(message)s', level=logging.INFO)

# 示例文本数据（实际应用中应替换为真实语料）
sentences = [
    ["冠军", "戒指", "是", "运动员", "的", "荣誉", "象征"],
    ["NBA", "总冠军", "戒指", "非常", "珍贵"],
    ["奥运", "金牌", "和", "冠军", "戒指", "都", "代表", "最高", "荣誉"],
    ["这枚", "冠军", "戒指", "由", "黄金", "和", "钻石", "制成"],
    ["冠军", "奖杯", "和", "戒指", "是", "体育", "赛事", "的", "重要", "奖品"],
    ["世界杯", "冠军", "会", "获得", "特制", "戒指"],
    ["戒指", "上", "刻有", "冠军", "的", "名字", "和", "年份"],
    ["这枚", "戒指", "象征", "着", "球队", "的", "冠军", "荣耀"]
]

# 训练Word2Vec模型
model = Word2Vec(sentences, vector_size=100, window=5, min_count=1, workers=4)

# 查找与"冠军戒指"相近的关键词
similar_words = model.wv.most_similar(positive=["冠军", "戒指"], topn=10)

# 准备结果文本
result_text = "与'冠军戒指'相近的10个关键词:\n"
result_text += "================================\n"
for word, similarity in similar_words:
    result_text += f"{word}: {similarity:.4f}\n"

# 保存结果到文件
output_file_name = "冠军戒指相近关键词.txt"
with open(output_file_name, 'w', encoding='utf-8') as f:
    f.write(result_text)

# 打印保存的文件名和成功消息
print(f"文件 {output_file_name} 已成功保存。")
print("结果内容如下:")
print(result_text)