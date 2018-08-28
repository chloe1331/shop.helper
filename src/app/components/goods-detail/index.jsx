import React, { Component } from 'react';
import moment from 'moment';
import { Divider } from 'antd';
import PropTypes from 'prop-types';

import './style.less';

export default class GoodsDetail extends Component {
    render() {
        const { data } = this.props;

        return (
            <div className="goods-detail-content">
                <div className="goods-detail-content-hd">
                    <h3 className="title">{data.title}</h3>
                    <div className="sub">
                        <span>创建时间 {moment(data.created_at).format('YYYY-MM-DD HH:mm:ss')}</span>
                    </div>
                </div>
                <div className="goods-detail-content-bd">
                    <div className="goods-detail-content-item">
                        <label><Divider>商品主图</Divider></label>
                        <div className="value goods-image">
                            {data.images.map((item, index) => (
                                <img key={index} alt="" src={item} />
                            ))}
                        </div>
                    </div>
                    <div className="goods-detail-content-item">
                        <label><Divider>商品详情</Divider></label>
                        <div className="value goods-detail">
                            <div dangerouslySetInnerHTML={{ __html: data.descForPC }}></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

GoodsDetail.propTypes = {
    data: PropTypes.object.isRequired
};