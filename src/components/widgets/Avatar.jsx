const Avatar = ({ data, placeHolder, name, customClass, customImageClass, height, width }) => {
  return <>{data?.original_url ? <div>{data?.original_url && <img loading="lazy" className={customClass ? customClass : ""} src={data?.original_url} height={height || 50} width={width || 50} alt={name?.name || name || ""} />}</div> : placeHolder ? <div className={`${customClass ? customClass : ""}`}>{placeHolder && <img loading="lazy" className={customImageClass ? customImageClass : ""} src={placeHolder} height={height || 50} width={width || 50} alt={name?.name || name || ""} />}</div> : <h4 className="user-name">{name?.name?.charAt(0).toString().toUpperCase() || name?.charAt(0).toString().toUpperCase()}</h4>}</>;
};

export default Avatar;
