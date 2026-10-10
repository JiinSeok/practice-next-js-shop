import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import SizeReviewList from '@/components/SizeReviewList';
import Image from 'next/image';
import styles from '@/styles/Product.module.css';

export async function getServerSideProps(context) {
  // 프리렌더링 과정에서 제공되는 페이지 생성 정보 context 객체를 받을 수 있다.
  const productId = context.params['id'];
  let product;

  try {
    const response = await axios.get(`/products/${productId}`);
    product = response.data;
  } catch {
    return {
      notFound: true,
    };
  }

  const response = await axios.get(`/size_reviews/?product_id=${productId}`);
  const sizeReviews = response.data.results ?? [];

  return {
    props: {
      product,
      sizeReviews,
    },
  };
}

export default function Product({ product, sizeReviews: initialSizeReviews }) {
  const [sizeReviews, setSizeReviews] = useState(initialSizeReviews);
  const [formValue, setFormValue] = useState({
    size: 'M',
    sex: 'female',
    height: 161,
    fit: 'good',
  });

  async function handleSubmit(e) {
    e.preventDefault();
    const sizeReview = {
      ...formValue,
      productId: product.id,
    };
    const response = await axios.post('/size_reviews/', sizeReview);
    const newSizeReview = response.data;
    setSizeReviews((prevSizeReviews) => [newSizeReview, ...prevSizeReviews]);
  }

  async function handleInputChange(e) {
    const { name, value } = e.target;
    handleInputChange(name, value);
  }

  async function handleChange(name, value) {
    setFormValue({
      ...formValue,
      [name]: value,
    });
  }

  if (!product) {
    return <div>Loading...</div>; // 데이터 렌더링 안 되어 있을 때 나타날 로딩 화면
  }

  return (
    <div>
      <h1>{product.name}</h1>
      <div className={styles.image}>
        <Image fill src={product.imgUrl} alt={product.name} />
      </div>
      <SizeReviewList sizeReviews={sizeReviews ?? []} />
      <h2>사이즈 추천하기</h2>
      <form onSubmit={handleSubmit}></form>
    </div>
  );
}
