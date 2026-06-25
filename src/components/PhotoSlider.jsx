import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import styles from './PhotoSlider.module.css';

export function PhotoSlider({ photos }) {
  if (!photos?.length) return null;

  if (photos.length === 1) {
    return (
      <div className={styles.wrap}>
        <img src={photos[0]} alt="" className={styles.img} />
      </div>
    );
  }

  return (
    <div className={`${styles.wrap} ${styles.swiperWrap}`}>
      <Swiper
        modules={[Pagination]}
        pagination={{ clickable: true }}
        spaceBetween={8}
        slidesPerView={1}
      >
        {photos.map((src, i) => (
          <SwiperSlide key={i}>
            <img src={src} alt="" className={styles.img} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
